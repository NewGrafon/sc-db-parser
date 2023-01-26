// LIBS
import fs from "fs";
const path = require('path');
import { execSync } from 'child_process';
import { ItemProperties } from "./Static/itemProperties-class";
import { ParseMedicine } from './Parsing Functions/parseMedicine';
import { ParseWeapon } from './Parsing Functions/parseWeapon';
import { ParseMeleeWeapon } from './Parsing Functions/parseMeleeWeapon';
import {ParseAttachment} from "./Parsing Functions/parseAttachment";
import {ParseBullet} from "./Parsing Functions/parseBullet";
import {ParseDevice} from "./Parsing Functions/parseDevice";
import {ParseGrenade} from "./Parsing Functions/parseGrenade";
import {ParseContainer} from "./Parsing Functions/parseContainer";
import {ParseArtefact} from "./Parsing Functions/parseArtefact";
import {ParseArmor} from "./Parsing Functions/parseArmor";
// END LIBS

// CONST'S
export const IndexDirName: string = __dirname;
import { UrlToSCDB, PathToClone, PathToParse } from "./Static/fileds";
const PathToDB: string = __dirname+'\\'+PathToClone;
const FoldersNeedsToPullInsteadOfClone: string[] = ['global', 'ru'];
// END CONST'S

function callGit(type = ''): void {
    switch (type) {
        case 'clone': {
            execSync(`git clone ${UrlToSCDB} .`, {
                stdio: [0, 1, 2], // we need this so node will print the command output
                cwd: path.resolve(__dirname, PathToDB), // path to where you want to save the file
            });
            break;
        }
        case 'pull': {
            execSync(`git pull ${UrlToSCDB}`, {
                stdio: [0, 1, 2], // we need this so node will print the command output
                cwd: path.resolve(__dirname, PathToDB), // path to where you want to save the file
            });
            break;
        }
        default: {
            throw new Error('type is incorrect or null');
        }
    }
}

function PrepareData(): void {
    if (!fs.existsSync(PathToDB)) {
        fs.mkdirSync(PathToDB, { recursive: true });
        callGit('clone');
    } else {
        let allExists: boolean = true;
        FoldersNeedsToPullInsteadOfClone.map(value => {
            if (!fs.existsSync(PathToDB+'\\'+value)) {
                allExists = false;
            }
        })

        if (allExists) {
            callGit('pull');
        } else {
            callGit('clone');
        }
    }

    console.log('\nClone/Pull was finished!\nStarting parsing...');
}

async function ParseAllData(server = '') {
    if (!(server === 'ru' || server === 'global')) {
        console.error('ParseAllData: incorrect server name.');
        return;
    }

    if (!fs.existsSync(__dirname+'\\'+PathToParse)) {
        fs.mkdirSync(__dirname+'\\'+PathToParse, { recursive: true });
    }

    const pathToItemsFolder = PathToDB+'\\'+server+'\\'+'items'+'\\';

    await ParseArmor(pathToItemsFolder+'armor\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseArmor: complete!');
        });

    await ParseArtefact(pathToItemsFolder+'artefact\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseArtefact: complete!');
        });

    await ParseContainer(pathToItemsFolder+'containers\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseContainer: complete!');
        });

    // await ParseBackpack(pathToItemsFolder+'backpack\\'); // юзлесс на данный момент

    await ParseMedicine(pathToItemsFolder+'medicine\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseMedicine: complete!');
        });

    await ParseWeapon(pathToItemsFolder+'weapon\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseWeapon: complete!');
        });

    await ParseAttachment(pathToItemsFolder+'attachment\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseAttachment: complete!');
        });

    await ParseBullet(pathToItemsFolder+'bullet\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseBullet: complete!');
        });

    await ParseMeleeWeapon(pathToItemsFolder + 'weapon\\melee\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseMeleeWeapon: complete!');
        });

    await ParseGrenade(pathToItemsFolder+'grenade\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseGrenade: complete!');
        });

    await ParseDevice(pathToItemsFolder+'weapon\\device\\')
        .then(PushToListing)
        .catch((e) => { console.error(e); })
        .finally(() => {
            console.log (server.toUpperCase()+': ParseDevice: complete!');
        });

    fs.writeFileSync(__dirname+'\\'+PathToParse+'\\'+server+'\\'+'listing.json', JSON.stringify(ListingJSON, null, 4));
}

async function StartParse() {
    await ParseAllData('ru');
    await ParseAllData('global');
}

const ListingJSON: object[] = [];
function PushToListing(data: object[]): void {
    data.forEach((item: any) => ListingJSON.push({
        exbo_id: item.exbo_id,
        key: item.key,
        category: item.class,
        name: {
            ru: item.name.ru,
            en: item.name.en
        }
    }))
}

// START PROGRAM
PrepareData();
ItemProperties.Init();
StartParse()
    .then(() => {
        console.log("Parsing complete!")
    })
    .catch((e) => {
        console.error(e);
    });
