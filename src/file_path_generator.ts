import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface ExportedModules {type:string,name:string,code:string};

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
            
            const exports:ExportedModules[] = getExportsFromCurrentFile(data);
            // import the file to be tested 
            let imp:any = '*';
            if(exports.length > 1){
                imp = '{';
                exports.forEach(element => {
                    imp += element.name + ',';
                });
                imp += '}';
            } else if (exports.length ===1){
                imp = exports[0].name;
            }          
            logger.write(`import ${imp} from \'${importPath.replace('//',`/`)}\' ;\n\n`);
            writeDescribeStructure(exports,logger);
        };
      });
}
function writeDescribeStructure(exports:ExportedModules[],logger){    
    logger.write('describe(\'Testing replace file name\', () => {\n');
    exports.forEach(element => {
        if(element.type === 'function'){
            logger.write(`describe(\'${element.name}\', () => { \n});\n`);
        }
    });
    logger.write('});');
}
function getExportsFromCurrentFile(fileContent:string): ExportedModules[]{
    const exports:ExportedModules[] = [];
    // everything that starts with export and ends with { or =;
    // keep a key:valuetype, value
    // where key is the export
    // value type is const, function
    // value is data
    const reg: RegExp = /export?.*{|export?.*=/g;
    let results =  fileContent.matchAll(reg);
    // keep a key:valuetype, value
    // where key is the export
    // value type is const, function
    // value is data
    for (const match of results){
        // will be dealing with export const, export default function, export function
        // fixme: add for interfaces
        const content = fileContent.substring(match.index);
        if (content.startsWith('export const')){
            // no ut's for const, adding for imports            
            const name = content.substring('export const'.length);
            const nameArray = name.trim().split('=');
            exports.push({code:match,type:'const',name:nameArray[0]});
        }else if(content.startsWith('export default function')){
            const functionCode = getCode(content);
            const name = content.substring('export default function'.length);
            const nameArray = name.trim().split('(');
            exports.push({code:functionCode,type:'function',name:nameArray[0]});
        } else if(content.startsWith('export function')){
            const functionCode = getCode(content);
            const name = content.substring('export function'.length);
            const nameArray = name.trim().split('(');
            exports.push({code:functionCode,type:'function',name:nameArray[0]});
        }
    }
    return exports;
}
function getPosition(str:string, subString:string, index = 2) {
    return str.split(subString, index).join(subString).length;
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

function getCode(data:string){
    let code = '';
    let count = 0;
    let flag = 0;
    for (let i=0; i < data.length; i++){
        if(data[i] === '{' ){
            count+=1;
            flag = 1;
        }
        if (data[i] === '}') {
            count-=1;
        }
        code+=data[i];
        if ((flag === 1) && (count === 0)){
            break;
        }
    }
    return code;
}
