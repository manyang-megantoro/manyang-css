# Contributing to Manyang CSS Hover

Thank you for your interest in contributing to the Manyang CSS Hover project! We welcome contributions from the community. Please follow the guidelines below to ensure a smooth collaboration.



## Adding a New Module (Effect/Model)

1. **Create a New Module Folder**
    - Copy the `module/example-module` folder as a template.
    - Rename the folder to your module's name.

2. **SCSS**
    - Add your main SCSS file in `module/your-module/scss/manyang-your-module.scss`.
    - All classes must start with `manyang-` to avoid conflicts.

3. **effect-map.json**
    - Only extend effects/models for triggers that already exist in the core (e.g., hover, click, drag).
    - **DO NOT** add a `prefix` property in your module. Prefixes are only defined in the core (`demo/effect-map.json`).
    - If you need a new trigger, coordinate with the maintainers to add it to the core first.
    - Example (correct usage):
       ```json
       {
          "relation": {
             "hover": {
                "list": {
                   "example-flip": ["example-box"]
                }
             }
          },
          "model": {
             "example-box": "<div class=\"manyang-example-box {effectClass}\">Example Box</div>"
          }
       }
       ```

4. **Automatic Merging**
    - Run the script `npm run merge-modules` to merge all modules into `demo/module-map.json`.
    - If your module tries to add a prefix or a new trigger without coordination, the script will warn and ignore those changes.

5. **Test in the Demo**
    - After merging, your module's effects and models will automatically appear in the demo.

6. **Documentation**
    - Add or update the README.md in your module folder to describe your module's features.

## How to Contribute

1. **Fork the Repository**: Start by forking the repository to your own GitHub account.

2. **Clone Your Fork**: Clone your forked repository to your local machine.
   ```
   git clone https://github.com/your-username/manyang-css-hover.git
   ```

3. **Create a Branch**: Create a new branch for your feature or bug fix.
   ```
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes**: Make your changes in the codebase. Ensure that your code adheres to the project's coding standards.

5. **Test Your Changes**: Run the tests to ensure your changes do not break existing functionality. If applicable, add new tests for your changes.

6. **Commit Your Changes**: Commit your changes with a clear and descriptive commit message.
   ```
   git commit -m "Add a brief description of your changes"
   ```

7. **Push to Your Fork**: Push your changes to your forked repository.
   ```
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**: Navigate to the original repository and create a pull request from your branch. Provide a detailed description of your changes and why they should be merged.

## Code of Conduct

Please adhere to the [Code of Conduct](CODE_OF_CONDUCT.md) while participating in this project. We expect all contributors to treat each other with respect and kindness.

## Issues

If you encounter any issues or have suggestions for improvements, please open an issue in the repository. Provide as much detail as possible to help us understand the problem.

## Documentation

For any changes that affect the documentation, please update the relevant files in the `docs` directory.

## Thank You!

We appreciate your contributions and support in making Manyang CSS Hover better!