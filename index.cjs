'use strict'
const ec = require("elliptic").ec;
const forge = require("node-forge");
const curve = new ec("curve25519");
const elliptic = require("elliptic");

function encodePublicArray(publicKey){
    return publicKey.map(x => {
        x = x.toString(16);
        x = x.padStart(2, "0");
        return x;
    }).join("");
}

function decodePublic(publicKey){
    return publicKey.match(/([a-z0-9]){0,2}/g).map(x => parseInt(x, 16)).filter(x => !isNaN(x));
}



class KeyPair{
    /**
     * 
     * @param {String?} importedKey - Private key of the user
     */
    constructor(importedKey){
        if(importedKey && typeof importedKey != "string") throw new Error("Invalid argument type"); 
        const pair = importedKey ? curve.keyFromPrivate(importedKey) : curve.genKeyPair();
        this.publicKey = encodePublicArray(pair.getPublic().encode("array"));
        this.privateKey = pair.getPrivate().toString("hex");
        this.masterKey = pair.derive(pair.getPublic()).toString("hex");
    }

    /**
     * 
     * @param {String} plaintext - String to encrypt
     * @returns {String} Encrypted String
     */
    async encrypt(plaintext){
        if(!plaintext) throw new Error("No argument was passed");
        return new Promise((resolve, reject) => {
            try{
                const salt = forge.random.getBytesSync(16);
                const key = forge.pkcs5.pbkdf2(this.masterKey, salt, 100e3, 16);
                const aes = forge.cipher.createCipher('AES-CBC', key);
                const iv = forge.random.getBytesSync(16);
                aes.start({iv});
                aes.update(forge.util.createBuffer(plaintext));
                aes.finish();
                resolve(`${forge.util.encode64(aes.output.data)}.${forge.util.encode64(iv)}.${forge.util.encode64(salt)}`)
            }catch(e){
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} enconded - Encrypted String
     * @returns {String} Decrypted String
     */
    async decrypt(encoded){
        if(!encoded) throw new Error("No argument was passed");
        if(typeof encoded != "string") throw new Error("Invalid argument type");
        encoded = encoded.split(/\./g);
        if(encoded.length > 3) throw new Error("Corrupted or invalid key")
        return new Promise((resolve, reject) => {
            try{
                const salt = forge.util.decode64(encoded[2]);
                const iv = forge.util.decode64(encoded[1]);
                const key = forge.pkcs5.pbkdf2(this.masterKey, salt, 100e3, 16);
                const aes = forge.cipher.createDecipher('AES-CBC', key);
                aes.start({iv});
                aes.update(forge.util.createBuffer(forge.util.decode64(encoded[0])));
                aes.finish();
                resolve(aes.output.data);
            }catch(e){
                reject(e);
            }
        })
    }

    /**
     * Returns the key used to decrypt
     * @param {String} password - password to be used to encrypt the private key.
     * @returns {String} Encrypted private key.
     */
    async encryptKey(password){
        if(!password) throw new Error("No argument was passed");
        if(typeof password != "string") throw new Error("Invalid argument type");
        return new Promise((resolve, reject) => {
            try{
            const salt = forge.random.getBytesSync(16);
            const key = forge.pkcs5.pbkdf2(password, salt, 100e3, 16);
            const aes = forge.cipher.createCipher('AES-CBC', key);
            const iv = forge.random.getBytesSync(16);
            aes.start({iv});
            aes.update(forge.util.createBuffer(this.privateKey));
            aes.finish();
            resolve(`${forge.util.encode64(aes.output.data)}.${forge.util.encode64(iv)}.${forge.util.encode64(salt)}}`);
            }catch(e){
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} sessionKey - Public key to be computed 
     * @returns {String} Master key shared between 2 KeyPairs
     */
    async computeKey(sessionKey){
        if(!sessionKey) throw new Error("No argument was passed");
        if(typeof sessionKey != "string") throw new Error("Invalid argument type");
        return new Promise((resolve, reject) => {
            try{
                const pair = curve.keyFromPrivate(this.privateKey);
                const curveSession = new ec("curve25519");
                const session = curveSession.keyFromPublic(decodePublic(sessionKey));
                const publi = session.getPublic();
                resolve(pair.derive(publi).toString("hex"));
        }catch(e){
            reject(e);
        }

        })
    }
}


/**
 * 
 * @param {String} plaintext Text that is going to be encrypted
 * @param {String} password Password that will be used to encrypt the String
 * @returns {String} Encrypted String
 */
async function encryptWithPassword(plaintext, password){
    if(!password || !plaintext) throw new Error("Expected 2 arguments");
    if(typeof plaintext != "string") throw new Error("Invalid first argument type");
    if(typeof password != "string") throw new Error("Invalid second argument type");
    return new Promise((resolve, reject) => {
        try{
            const salt = forge.random.getBytesSync(16);
            const key = forge.pkcs5.pbkdf2(password, salt, 100e3, 16);
            const aes = forge.cipher.createCipher('AES-CBC', key);
            const iv = forge.random.getBytesSync(16);
            aes.start({iv});
            aes.update(forge.util.createBuffer(plaintext));
            aes.finish();
            resolve(`${forge.util.encode64(aes.output.data)}.${forge.util.encode64(iv)}.${forge.util.encode64(salt)}`);
        }catch(e){
            reject(e);
        }
    })
    
}

/**
 * 
 * @param {String} encoded Encrypted String
 * @param {String} password The password to decrypt the encrypted String
 * @returns {String} Decrypted String
 */
function decryptWithPassword(encoded, password){
    if(!encoded || !password) throw new Error("Expected 2 arguments");
    if(typeof encoded != "string") throw new Error("Invalid first argument type");
    if(typeof password != "string") throw new Error("Invalid second argument type");
    encoded = encoded.split(/\./g);
    if(encoded.length > 3) throw new Error("Corrupted or invalid content")
    return new Promise((resolve, reject) => {
        try{
            const salt = forge.util.decode64(encoded[2]);
            const iv = forge.util.decode64(encoded[1]);
            const key = forge.pkcs5.pbkdf2(password, salt, 100e3, 16);
            const aes = forge.cipher.createDecipher('AES-CBC', key);
            aes.start({iv});
            aes.update(forge.util.createBuffer(forge.util.decode64(encoded[0])));
            aes.finish();
            resolve(aes.output.data); 
        }catch(e){
            reject(e)
        }
    }) 
}

/**
 * 
 * @param {String} encoded - Encrypted private key
 * @param {String} password - Password used to decrypt the key
 * @returns {String} Decrypted private key
 */
async function decryptKey(encoded, password){
    return await decryptWithPassword(encoded, password);
}

 module.exports = {decryptKey, KeyPair, encryptWithPassword, decryptWithPassword}
