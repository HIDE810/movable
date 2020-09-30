var input_file = document.getElementById("file");

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

function handleDownload() {
    var blob = new Blob([lfcs_B],{type:"application/octet-stream"});
    document.getElementById("download").href = URL.createObjectURL(blob);
}

input_file.onchange = function (){

    if(!(input_file.value)) return;
    if(!(window.FileReader)) return;
    
    var file_list = input_file.files;
    if(!file_list) return;

    var file = file_list[0];
    if(!file) return;

    var file_reader = new FileReader();
    
    const seed = [83, 69, 69, 68]; /* "SEED" */
    
    file_reader.onload = function(e){

        var ary_u8 = new Uint8Array(file_reader.result);
        var magic = ary_u8.slice(0, 4).toString();
        
        if(magic != seed) {
            document.getElementById("error").innerHTML = "※Error: Invalid file.";
            return;
        }
        
        lfcs_B = ary_u8.slice(8, 280);
        
        var lfcs = toHexString(ary_u8.slice(272, 280));
        var keyY = toHexString(ary_u8.slice(272, 288));
        
        const shaObj = new jsSHA("SHA-256", "HEX");
        shaObj.update(keyY);
        const hash = shaObj.getHash("HEX").match(/.{2}/g).slice(0, 16);
        
        var start = 0;
        var end = 4;
        
        var id0 = [];
        
        for(let i=0; i<4; i++) {
            
            id0.push(hash.slice(start, end).reverse().join(''));
            
            start += 4;
            end += 4;
        }
        
        document.getElementById("lfcs").innerHTML = lfcs + "&nbsp<a id='download' download='LocalFriendCodeSeed_B' onclick='handleDownload()'><button>Download</button></a>";
        document.getElementById("keyY").innerHTML = keyY;
        document.getElementById("id0").innerHTML = id0.join('');
        document.getElementById("error").innerHTML = "";
    };
    
    file_reader.readAsArrayBuffer(file);
};