# PUBLISHING.md

To publish the "manyang-css-hover" package to npm, follow these steps:

1. **Prepare Your Package**:
   - Ensure that all changes are committed to the main branch.
   - Update the version number in `package.json` according to semantic versioning (semver). Use the following command to bump the version:
     - For a patch update: `npm version patch`
     - For a minor update: `npm version minor`
     - For a major update: `npm version major`

2. **Build the Project**:
   - Run the build command to compile the SCSS and CSS files. This is typically done using Rollup:
     ```
     npm run build
     ```

3. **Run Tests**:
   - Ensure that all tests pass before publishing:
     ```
     npm test
     ```

4. **Login to npm**:
   - If you are not already logged in, use the following command to log in to your npm account:
     ```
     npm login
     ```

5. **Publish the Package**:
   - Once everything is ready, publish the package to npm using:
     ```
     npm publish
     ```

6. **Verify the Publication**:
   - After publishing, check the npm registry to ensure that your package is listed correctly. You can do this by visiting `https://www.npmjs.com/package/manyang-css-hover`.

7. **Post-Publication**:
   - Update the `CHANGELOG.md` file with the new version and a summary of changes.
   - Tag the release in Git:
     ```
     git tag v<new_version>
     git push origin v<new_version>
     ```

By following these steps, you will successfully publish the "manyang-css-hover" package to npm.