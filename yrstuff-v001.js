document.addEventListener("DOMContentLoaded", function() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    const now = new Date();
    console.log(`Current page: ${page}, Loaded on: ${now.toLocaleString()}`);
});

// Function to fetch and parse the _quarto.yml file
async function fetchYamlMapping() {
    try {
        const response = await fetch('_quarto.yml');
        const yamlText = await response.text();
        
        // Extract filename and chapter number mappings using regex
        const chapterMappings = new Map();
        const pattern = /- (.*\.qmd)\s*#\s*yrChapterNumber\s*(\S+)/g;
        let match;
        
        while ((match = pattern.exec(yamlText)) !== null) {
            const [, filename, chapterNumber] = match;
            chapterMappings.set(filename, chapterNumber);
        }
        
        return chapterMappings;
    } catch (error) {
        console.error('Error fetching or parsing _quarto.yml:', error);
        return new Map();
    }
}

// Function to get the current page's filename from its URL
function getCurrentPageFilename() {
    const path = window.location.pathname;
    // Remove the .html extension and add .qmd
    const filename = path.split('/').pop().replace('.html', '.qmd');
    return filename;
}

// Function to update chapter and section numbers
function updateNumbers(chapterMappings) {
    const currentFile = getCurrentPageFilename();
    const newChapterNumber = chapterMappings.get(currentFile);
    
    if (!newChapterNumber) {
        console.warn(`No chapter mapping found for ${currentFile}`);
        return;
    }
    
    // Update main chapter number
    const chapterElements = document.querySelectorAll('.chapter-number');
    chapterElements.forEach(element => {
        element.textContent = newChapterNumber;
    });
    
    // Update section numbers
    const sectionElements = document.querySelectorAll('.header-section-number');
    sectionElements.forEach(element => {
        const sectionNumber = element.textContent;
        // Replace everything before the first period with the full chapter number
        const updatedSection = sectionNumber.replace(
            /^[^.]+/,
            newChapterNumber
        );
        element.textContent = updatedSection;
    });
}

// Main execution
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const chapterMappings = await fetchYamlMapping();
        updateNumbers(chapterMappings);
    } catch (error) {
        console.error('Error in chapter number override:', error);
    }
});