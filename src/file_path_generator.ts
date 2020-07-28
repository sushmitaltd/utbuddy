import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function createAndWriteToFile(filePath:string): void{
    fs.writeFile(filePath, "content of the file", (error)=>{
        if (error){
            console.error('Error occured', error);
        }
        else{
            console.log('Created boiler plate');
        }
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

    createAndWriteToFile(newDirectoryPath+"\\"+ fileName+'.test.ts');   
}