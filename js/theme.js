const url = "https://itu-sdbg-s2020.now.sh/api/themes"
const themes = []
const root = document.documentElement
var themeId

/**
 * Initializes all themes
 * 
 * Denne funktion er skrevet af Jeppe, Johan og Benjamin
 */
async function initThemes() {
    themes.push({
        id: 0,
        name: 'Default',
        styles: {
            primaryColor: getComputedStyle(root).getPropertyValue('--primary-color').trim().substring(1),
            secondaryColor: getComputedStyle(root).getPropertyValue('--secondary-color').trim().substring(1),
            fontFamily: getComputedStyle(root).getPropertyValue('--font-family').replace(/'|"/g, "").trim()
        }
    })

    await fetchThemes()
    const selectedId = localStorage.getItem("styleid")
    changeTheme((selectedId != null) ? selectedId : 0)
    const color = localStorage.getItem('font-color')
    if (color != null) root.style.setProperty('--font-color', color)
    const imageChecked = localStorage.getItem("imageTitleChecked")
    const albumChecked = localStorage.getItem("albumTitleChecked")
    if (imageChecked == null) localStorage.setItem("imageTitleChecked", true)
    if (albumChecked == null) localStorage.setItem("albumTitleChecked", true)
}

/**
 * Gets the themes from the itu-sdbg-s2020 api
 * 
 * Denne funktion er skrevet af Jeppe og Johan
 */
function fetchThemes() {
    return new Promise((resolve, reject) => {
        fetch(url).then(response => response.json()).then((data) => {
            themes.push(...data.themes) // Pushes all content of data.themes to themes array
            resolve()
        })
            .catch(err => reject(err))
    })
}

/**
 * Changes the current theme to the specified theme
 * 
 * Denne funktion er skrevet af Jeppe, Johan og Benjamin
 * 
 * @param {String} id id of the theme to change to
 */
function changeTheme(id) {
    root.style.setProperty('--primary-color', "#" + themes[id].styles.primaryColor);
    root.style.setProperty('--secondary-color', "#" + themes[id].styles.secondaryColor);
    root.style.setProperty('--font-family', `'${themes[id].styles.fontFamily}'`);
    localStorage.setItem("styleid", id);
}

/**
 * Changes the color of all text
 * 
 * Lavet af Nikolaj og Daniel
 * 
 * @param {String} color the color to change text to
 */
function changeColor(color) {
    root.style.setProperty('--font-color', color)
    localStorage.setItem('font-color', color)
}


/**
 * Changes whether to show image titles on preview or not
 * 
 * Lavet af Nikolaj og Daniel
 */
function changeShowImageTitle() {
    const imageTitleBox = document.getElementById('imageTitle').checked
    localStorage.setItem("imageTitleChecked", imageTitleBox)
}

/**
 * Changes whether to show album titles on preview or not
 * 
 * Lavet af Nikolaj og Daniel
 */
function changeShowAlbumTitle() {
    const albumTitleBox = document.getElementById('albumTitle').checked
    localStorage.setItem("albumTitleChecked", albumTitleBox)
}