function v1Bigger(v1, v2) {
    let v1parts = v1.split('.').map(Number),
        v2parts = v2.split('.').map(Number);

    for (let i = 0; i < v1parts.length; i++) {
        if (v2parts.length == i) return true;

        if (v1parts[i] == v2parts[i]) continue
        else if (v1parts[i] > v2parts[i]) return true
        else return false
    }

    if (v1parts.length != v2parts.length) return false;
    return false;
}


module.exports = { v1Bigger };