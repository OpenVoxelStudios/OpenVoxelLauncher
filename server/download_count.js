require('dotenv').config();
const { Octokit } = require("octokit");
const octokit = new Octokit({ auth: process.env.GH_KEY })


octokit.request('GET /repos/{owner}/{repo}/tags', {
    owner: 'OpenVoxelStudios', repo: 'OpenVoxelLauncher',
    per_page: 50,
}).then(releaseList => {
    releaseList = releaseList.data.map(d => d.name).reverse();

    Promise.all(releaseList.map(tag => {
        return new Promise(async (resolve) => {
            let answ = await octokit.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
                owner: 'OpenVoxelStudios', repo: 'OpenVoxelLauncher', tag: tag,
                headers: { 'X-GitHub-Api-Version': '2022-11-28' }
            })
                .catch((err) => console.error(err));

            resolve({
                tag: tag,
                data: (answ?.data?.assets?.map(asst =>
                    (["latest-mac.yml", "latest.yml"].includes(asst.name) || asst.name.endsWith('.blockmap'))
                        ? undefined
                        : { name: asst.name, download_count: asst.download_count }
                ) || [])
                    .filter(e => e)
                    .sort((a, b) => a.download_count - b.download_count)
                    .reverse()
            });
        });
    })).then(final => {
        for (let tag of final) {
            console.log(`---   TAG: ${tag.tag}   ---`);
            console.table(tag.data.map(t => {
                return { "Name": t.name, "Download Count": t.download_count }
            }));
        }
    })
})