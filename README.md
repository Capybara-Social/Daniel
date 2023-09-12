# Daniel 

The standard library for encryption and decryption of Capybara.

## installation


### npm
```bash
npm install @capybara-social/daniely
```

### yarn
```bash
yarn add @capybara-social/daniely
```

### pnpm
```bash
pnpm add @capybara-social/daniely
```


### Import

#### commonJS
```js
const { KeyPair } = require("@capybara-social/daniel");
```

#### ES
```js
import { KeyPair } from "@capybara-social/daniel"
```

## Keypairs

Capybara uses a hybrid encryption system between ECC(with Curve25519) and AES256-CBC

### Creating KeyPair
Firstly, we have to create a pair of keys, which we will use to encrypt and decrypt user's private info
```js
const myKeys = new KeyPair();

//If you want to create a pair from an imported private key you may use it like this
const importedKeys =new KeyPair("myVerySecretKey"); //Obviously change the "myVerySecretKey" with the imported private key
```

### Encrypting private information

This is the function you have to use to encrypt the private information of the user (Such as birthday, email, etc.)\[WARNING: DO NOT ENCRYPT THE PASSWORD!\]

```js
const myKeys = new KeyPair();
const myInfo = "This text is going to be encrypted!";
let encrypted = await myKeys.encrypt(myInfo); // => this returns the encrypted text

//Once encrypted you can send this info to the server
```

### Decrypting encrypted text

This is the function you have to use to decrypt the private information of the user. The decrypted info can NOT be saved anywhere. 
```js
let decrypted = await myKeys.decrypt(encrypted) // => this returns the decrypted text or throw an error 
```
### Encrypting private key
This function will encrypt the private key with a password(the user's password).
```js
const userPassword = "Really really secret password!";
let encryptedKey = await myKeys.encryptKey(userPassword);
``` 

### Decrypting private key
For this you will have to import another function which will decrypt the encrypted private key
\[WARNING: DO NOT SAVE THE DECRYPTED PRIVATE KEY!\]
#### CommonJS
```js
const {decryptKey} = require("@capybara-social/daniel");
```
#### ES
```js
import {decryptKey} from "@capybara-social/daniel"
```


#### Decryption
```js
const encryptedPrivateKey = "ThisIsMyEncryptedPrivateKey!";
const password = "CapybaraIsSexy123";
let decryptedKey = await decryptKey(encryptedPrivateKey, password);
```

## Encrypting and decrypting with password

For this you will have to import 2 function
#### CommonJS
```js
const {encryptWithPassword, decryptWithPassword} = require("@capybara-social/daniel");
```
#### ES
```js
import {encryptWithPassword, decryptWithPassword} from "@capybara-social/daniel"
```


### Encrypting
```js
const content = "Omg I don't want anyone to see this!";
const password = "CapybaraIsSexy123";
let encrypted = await encryptWithPassword(content, password);
```

### Decrypting
```js
const password = "CapybaraIsSexy123";
let decrypted = await decryptWithPassword(encrypted, password);
```

## Dependencies

* [elliptic](https://www.npmjs.com/package/elliptic) - Fast elliptic-curve cryptography in a plain javascript implementation.
* [node-forge](https://www.npmjs.com/package/node-forge) - A native implementation of TLS (and various other cryptographic tools) in JavaScript.

## License

This project is licensed under [Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/)

This means you have permission to:
* Share - copy and redistribute the material in any medium or format 
* Adapt - remix, transform, and build upon the material
for any purpose, even commercially. 

Under the following terms: 
* Attribution - You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use. 
* ShareAlike - If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original. 


For more information, you may check this two sites:

* [Human Readable License](https://creativecommons.org/licenses/by-sa/4.0/)
* [Legal Code](https://creativecommons.org/licenses/by-sa/4.0/legalcode)


## Wow you really read all the documentation!

Ok so it looks like you've read all this doc. 
Heres a photo of a kitten i found on Wikipedia specially for u <3

![Beautfiul kitten](https://upload.wikimedia.org/wikipedia/commons/b/b7/White_kitten.jpg)
Goodbye!