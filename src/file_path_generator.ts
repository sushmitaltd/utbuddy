import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';



function createAndWriteToFile(newTestFilePath:string, filePath: string, importPath:string): void{
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
                logger.write(match[0]+'\n');
            }
            // import the file to be tested            
            logger.write(`import * from \'${importPath.replace('//',`/`)}\' \n`);
        };
      });
}

export default function testFilePathGenerator(filepath:string): void{
    const indexOfSrc= filepath.indexOf("\\src\\");
    const lastDirectoryIndex = filepath.lastIndexOf("\\");
    const fileName= filepath.substring(lastDirectoryIndex+1, filepath.length-3);
    let newDirectoryPath:string;
    let pathAfterSrc;
    if (indexOfSrc>=0){
        const pathTillSrc= filepath.substring(0,indexOfSrc+1); 
        pathAfterSrc = filepath.substring(indexOfSrc+4, lastDirectoryIndex);
        newDirectoryPath = pathTillSrc+'test'+pathAfterSrc;}       
    else {
        // If src is not present
        newDirectoryPath = filepath.substring(0,lastDirectoryIndex);
    }
    if (!fs.existsSync(newDirectoryPath)){
        fs.mkdirSync(newDirectoryPath, { recursive: true });}

    // import all exports from current file
    // test + pathaftersrc + filename is the new file location
    // path after src as  ../ + src + pathaftersrc + filename is the import path
    const countOfDots = pathAfterSrc.split('\\').length ;
    const dots = `../`.repeat(countOfDots);
    const importPath = `${dots}src/${pathAfterSrc}/${fileName}`;
    createAndWriteToFile(newDirectoryPath+"\\"+ fileName+'.test.ts', filepath, importPath.replace('\\',`/`));   
}