
var next = new Array();
function nextState(pattern) {
    let k = -1;
    let j = 0;
    next[0] = -1;
    while(j < pattern.length - 1) {
        if (k === -1 || pattern.charAt(k) === pattern.charAt(j)) {
            next[++j] = ++k;
        } else {
            k = next[k];
        }
    }
}

function search(text, pattern) {
    let j = 0;
    for(let i = 0; i < text.length; i++) {
        let c = text.charAt(i);
        if (c === pattern.charAt(j)) {
            j++;
        } else if (j === 0) {
            j = 0;
        } else {
            j = next[j];
        }
        if (j === pattern.length) {
            return i - j + 1;
        }
    }
    return -1;
}

const p = "ABCDABD";
nextState(p);
let result = search("BBC ABCDAB ABCDABCDABDE", p);
console.log(result);