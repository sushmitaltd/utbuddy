import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface ExportedModules {type:string,name:string,code:string};

function createAndWriteToFile(newTestFilePath:string, filePath: string, importPath:string, fileName:string, pathAfterSrc:string, countOfDots:number): void{
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
                if(match[0].includes('\'.')){
                    // const count = (match[0].match('../') || []).length;
                    // reverse iterate to math pathaftersrc
                    const curpath = match[0].split(' ');
                    const srcpath = `src${pathAfterSrc}`.split('\\');
                    const includePath = curpath[curpath.length - 1].replace('\'','').replace(';','').split('/');
                    // FixMe: includes that are outside of source
                    // .. indicates come out of folder
                    // take src path as base and come out of number of folders based on ..
                    let srcExcludePathCount = 0;
                    let extraPath = '/';
                    includePath.forEach(element => {
                        if(element === '..'){
                            srcExcludePathCount +=1;
                        }else{
                            extraPath += element + '/';
                        }
                    });
                    extraPath = extraPath.substring(0,extraPath.length-1);
                    const fullPath = srcpath.slice(0,srcpath.length-srcExcludePathCount).join('/') + extraPath;
                    const dots = `../`.repeat(countOfDots);
                    logger.write(curpath.slice(0,curpath.length-1).join(' ') + ' \'' + dots + fullPath + ';' + '\n');
                }else{
                logger.write(match[0]+'\n');
                }
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
            const formatted =  importPath.replace('//',`/`);
            logger.write(`import ${imp} from \'${formatted.replace(/\\/g, "/")}\' ;\n\n`);
            writeDescribeStructure(exports,logger,fileName);
        };
      });
}
function writeDescribeStructure(exports:ExportedModules[],logger,fileName:string){    
    logger.write(`describe(\'Testing ${fileName}\', () => {\n`);
    exports.forEach(element => {
        if(element.type === 'function'){
            const tab:any = `\t`;
            logger.write(`${tab}describe(\'${element.name}\', () => {\n${tab}});\n`);
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
    const reg: RegExp = /export?.|\n*{|export?.|\n*=/g;
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
        }else if(content.startsWith('export default async function')){
            const functionCode = getCode(content);
            const name = content.substring('export default async function'.length);
            const nameArray = name.trim().split('(');
            exports.push({code:functionCode,type:'function',name:nameArray[0]});
        } else if(content.startsWith('export async function')){
            const functionCode = getCode(content);
            const name = content.substring('export async function'.length);
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
    createAndWriteToFile(newDirectoryPath+"\\"+ fileName+'.test.ts', filepath, importPath.replace('\\',`/`),fileName,pathAfterSrc, countOfDots);   
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

