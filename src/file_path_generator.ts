import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export default function testFilePathGenerator(filepath:string): void{
    const indexOfSrc= filepath.indexOf("src");
    const pathTillSrc= filepath.substring(0,indexOfSrc);
    const pathAfterSrc = filepath.substring(indexOfSrc+3, filepath.length-2);
    const new_path = pathTillSrc+'test'+pathAfterSrc+'test.ts';
    if (!fs.existsSync(new_path)){
        fs.mkdirSync(new_path, { recursive: true });}
}