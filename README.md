# Minerva

I made this bot for my friends.

## Changing Minerva's Source Code

After changing the desired files, run the following command in the root directory to transpile Minerva's typescript back into javascript:

```
tsc
```

The transpiled code is outputted to the "prod" folder. Commit the changes to the repository. Go to the server you are hosting Minerva on, and type the following commands:

```
git pull
```

```
cd prod
```

```
pm2 start index.js
```