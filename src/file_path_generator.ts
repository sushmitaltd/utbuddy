import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';



function createAndWriteToFile(newTestFilePath:string, filePath: string): void{
    let data: string;
    fs.readFile(filePath, "utf8",(err, data) => {
        if (err) {console.error('Error occured', err);}
        else{
            var logger = fs.createWriteStream(newTestFilePath, {
                flags: 'w' 
              });
              
            const reg: RegExp = /import.*?;/g;
            let results = data.matchAll(reg);
            for (const match of results){
                logger.write(match[0]+ '\n');
            }
        };
      });
}

export default function testFilePathGenerator(filepath:string): void{
    const indexOfSrc= filepath.indexOf("\\src\\");
    const lastDirectoryIndex = filepath.lastIndexOf("\\");
    const fileName= filepath.substring(lastDirectoryIndex+1, filepath.length-3);
    let newDirectoryPath:string;
    
    if (indexOfSrc>=0){
        const pathTillSrc= filepath.substring(0,indexOfSrc+1); 
        const pathAfterSrc = filepath.substring(indexOfSrc+4, lastDirectoryIndex);
        newDirectoryPath = pathTillSrc+'test'+pathAfterSrc;}       
    else {
        // If src is not present
        newDirectoryPath = filepath.substring(0,lastDirectoryIndex);
    }
    if (!fs.existsSync(newDirectoryPath)){
        fs.mkdirSync(newDirectoryPath, { recursive: true });}

    createAndWriteToFile(newDirectoryPath+"\\"+ fileName+'.test.ts', filepath);   
}