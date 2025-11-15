// Script to merge all module documentation into main docs
const fs = require('fs');
const path = require('path');

function buildModuleDocs() {
    const modulesDir = path.join(__dirname, '../module');
    const docsDir = path.join(__dirname, '../docs');
    const modulesDocDir = path.join(docsDir, 'modules');
    
    // Create modules doc directory if it doesn't exist
    if (!fs.existsSync(modulesDocDir)) {
        fs.mkdirSync(modulesDocDir, { recursive: true });
    }
    
    // Get all module directories
    const modules = fs.readdirSync(modulesDir).filter(name => {
        const modulePath = path.join(modulesDir, name);
        return fs.statSync(modulePath).isDirectory();
    });
    
    // Build sidebar for modules
    let modulesSidebar = '';
    
    modules.forEach(moduleName => {
        const moduleDocsPath = path.join(modulesDir, moduleName, 'docs');
        const moduleOutputPath = path.join(modulesDocDir, moduleName);
        
        if (fs.existsSync(moduleDocsPath)) {
            // Create module output directory
            if (!fs.existsSync(moduleOutputPath)) {
                fs.mkdirSync(moduleOutputPath, { recursive: true });
            }
            
            // Copy all markdown files from module docs
            const docFiles = fs.readdirSync(moduleDocsPath)
                .filter(file => file.endsWith('.md'))
                .sort((a, b) => {
                    // Ensure README.md comes first
                    if (a === 'README.md') return -1;
                    if (b === 'README.md') return 1;
                    return a.localeCompare(b);
                });
            
            if (docFiles.length > 0) {
                // Format module name for display
                const displayName = moduleName.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                
                modulesSidebar += `  - [${displayName}](modules/${moduleName}/README.md)\n`;
                
                // Add sub-pages
                docFiles.forEach(file => {
                    const sourcePath = path.join(moduleDocsPath, file);
                    const destPath = path.join(moduleOutputPath, file);
                    fs.copyFileSync(sourcePath, destPath);
                    
                    if (file !== 'README.md') {
                        const fileName = path.basename(file, '.md');
                        const displayFileName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
                        modulesSidebar += `    - [${displayFileName}](modules/${moduleName}/${file})\n`;
                    }
                });
                
                console.log(`✅ Copied docs for module: ${moduleName}`);
            }
        } else {
            console.log(`⚠️  No docs found for module: ${moduleName}`);
        }
    });
    
    // Create or update sidebar
    const sidebarPath = path.join(docsDir, '_sidebar.md');
    let existingSidebar = `- [Home](README.md)\n- [Quick Start](quickstart.md)\n- [Demo](demo.md)\n`;
    
    if (fs.existsSync(sidebarPath)) {
        existingSidebar = fs.readFileSync(sidebarPath, 'utf8');
        // Remove old modules section
        existingSidebar = existingSidebar.replace(/- Modules\n(  -.*\n)*(    -.*\n)*/g, '');
    }
    
    // Add modules section if we have any
    if (modulesSidebar) {
        const newSidebar = existingSidebar.trimEnd() + `\n- Modules\n${modulesSidebar}`;
        fs.writeFileSync(sidebarPath, newSidebar);
        console.log('✅ Updated _sidebar.md with module documentation');
    } else {
        console.log('⚠️  No module documentation to add to sidebar');
    }
    
    console.log(`\n📖 Built documentation for ${modules.length} modules`);
}

// Run if called directly
if (require.main === module) {
    buildModuleDocs();
}

module.exports = buildModuleDocs;