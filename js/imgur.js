const clientId = "e6cad45aeaa6305"
const params = new URLSearchParams(window.location.search);
const images = []
var currentPos = 0;
var currentImageId;
var currentAlbumId;

/**
 * Creates an album locally
 * 
 * Denne funktion er skrevet af Johan & Jeppe
 * a
 * @param {String} title the title of the album
 * @param {String} description the desciption of the album
 */
function createAlbumImgur(title, description) {
    var formdata = new FormData();
    formdata.append("title", title);
    formdata.append("description", description);
    const id = generateUID()
    const albumArray = JSON.parse(localStorage.getItem("albumArray"))
    const album = { id: id, title: title, description: description }
    if (albumArray != null) {
        albumArray.push(album)
        localStorage.setItem("albumArray", JSON.stringify(albumArray))
    } else {
        localStorage.setItem("albumArray", JSON.stringify([album]))
    }
    location.href = `./pages/album.html?id=${id}`

}

/**
 * Uploads images to imgur and adds image to local album
 * 
 * Denne funktion er skrevet af Johan, Jeppe & Benjamin
 * 
 * @param {String} input the image input
 * @param {String} albumhash the album hash
 * @param {String} albumid id of the album to upload to
 * @param {String} title title of the image
 * @param {String} description description of the image
 */
function uploadImage(input, albumhash, albumid, title, description) {
    // henter filen
    var formdata = new FormData();
    formdata.append("image", input.split(",")[1]);
    formdata.append("title", title)
    formdata.append("description", description)

    fetch("https://api.imgur.com/3/image", new makeHeaders('POST', formdata))
        .then(response => response.text())
        .then((result) => {
            result = JSON.parse(result)
            addImageToCache(albumid, result.data)
            localStorage.setItem(result.data.id, result.data.deletehash)
            window.location.reload()
        })
        .catch(error => console.error('error', error));
}

/**
 * Loads all images from the cache
 * 
 * Denne metode er lavet af Johan
 * 
 * @param {String} albumid id of the album
 * @param {Object} currentCache the cache from local storage
 */
function loadImageCache(albumid, currentCache) {
    const keys = Object.keys(currentCache).reverse()
    const shouldRenderTitle = localStorage.getItem("imageTitleChecked") == "true"
    keys.forEach(function (key) {
        const image = currentCache[key];
        createImageCard(image.link, image.title, image.description, image.id, shouldRenderTitle)
    });
}

/**
 * Adds a image to the local storage
 * 
 * Denne metode er lavet af Johan & Benjamin
 * 
 * @param {String} albumid id of the album
 * @param {Image} imagedata the data for the image
 */
function addImageToCache(albumid, imagedata) {
    const id = imagedata.id
    const localData = JSON.parse(localStorage.getItem(albumid));

    if (localData != null) {
        localData[id] = imagedata;
        localStorage.setItem(albumid, JSON.stringify(localData))
    } else {
        const obj = {}
        obj[id] = imagedata
        localStorage.setItem(albumid, JSON.stringify(obj))
    }
}

/** 
 * Convertion to Base64
 * Inspired by code from Dmitry Vasiliev on StackOverflow
 * Link: https://stackoverflow.com/a/57272491
 * 
 * @param {File} file the file to be converted
 */
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

//https://stackoverflow.com/a/6248722
function generateUID() {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}

/**
 * Creates a Materialize card from a image
 * 
 * Denne metode er lavet af Jeppe, Johan & Benjamin
 * 
 * @param {Image} image the image to display in the card
 * @param {String} title the title of the image
 * @param {String} description the description of the image
 * @param {String} id id of the image
 * @param {String} deletehash deletehash of the image
 */
function createImageCard(image, title, description, id, shouldRenderTitle) {
    if (title == null) title = "Ingen titel"
    if (description == null) description = "Ingen beskrivelse"
    const deletehash = localStorage.getItem(id)
    let str;
    if (shouldRenderTitle) {
        str = `<span class="card-title">${title}</span>`
    } else {
        str = ""
    }
    $("#pictures").append(`
    <div id="${deletehash}" class="col s12 m6 l3 clickable post">
        <div onclick="setImageCurrentId('${id}')" class="btn-floating right waves-effect waves-light blue editButton modal-trigger" href="#editImageModal"><i class="material-icons">edit</i></div>
        <div onclick="setImageCurrentId('${id}')" class="btn-floating right waves-effect waves-light red deleteButton darken-4 modal-trigger" href="#removeImageConfirmationModal"><i class="material-icons">clear</i></div>
        <div class="card" onclick="openImage('${image}','${title}','${description}','${id}')">
            <div class="card-image">
            <img class="blurred-image unselectable" src="${image}">
            <img class="normal-image unselectable" src="${image}">
                ${str}
            </div>
            <div class="primary-color card-content">
                <p class="cardDescription">${description}</p>
            </div>
        </div>
    </div>`)

    images.push({ id: id, title: title, description: description })
}

/**
 * Gets albums from Imgur
 * 
 * Denne funktion er skrevet af Jeppe, Johan & Benjamin
 */
function fetchAlbumsImgur() {
    const albums = JSON.parse(localStorage.getItem("albumArray"))
    const showTitle = localStorage.getItem("albumTitleChecked") == "true"
    if (albums != null) {
        albums.forEach(album => {
            const cache = JSON.parse(localStorage.getItem(album.id))
            let keys = null;
            let cover = null;
            if (cache != null) {
                keys = Object.keys(cache)
                if (keys != null) {
                    cover = keys[0]
                }
            } else {
                cover = "Oq4SQRS" // white image
            }

            if (album.title.length == 0) album.title = "Ingen titel"
            if (album.description.length == 0) album.description = "Ingen beskrivelse"
            let str;
            if (showTitle) {
                str = `<span class="card-title">${album.title}</span>`
            } else {
                str = ""
            }
            $("#albums").append(`
            <div id="${album.id}" class="col s6 l3 clickable post">
            <div onclick="setAlbumCurrentId('${album.id}')" class="btn-floating right waves-effect waves-light blue editButton modal-trigger" href="#editAlbumModal"><i class="material-icons">edit</i></div>
            <div onclick="setAlbumCurrentId('${album.id}')" class="btn-floating right waves-effect waves-light red deleteButton darken-4 modal-trigger" href=#removeAlbumConfirmationModal ><i class="material-icons">clear</i></div>
            <div class="card" onclick="location.href='./pages/album.html?id=${album.id}'">
            <div class="card-image">
            <img class="blurred-image unselectable" src="https://i.imgur.com/${cover}.jpg">
            <img class="normal-image unselectable" src="https://i.imgur.com/${cover}.jpg">
            ${str}
            </div>
            <div class="primary-color card-content">
            <p class="cardDescription">${album.description}</p>
            </div>
            </div>
            </div>`)
        });
    }
}


/**
 * Gets all images from a album in Imgur
 * 
 * Denne metode er lavet af Jeppe & Johan
 * 
 * @param {String} albumid id of the album
 */
function fetchAlbumImages(albumid) {
    const cache = JSON.parse(localStorage.getItem(albumid))
    if (cache != null) {
        loadImageCache(albumid, cache)
    }
}

/**
 * Deletes an album locally
 * 
 * Denne funktion er skrevet af Jeppe
 * 
 * @param {String} id hash of the album
 */
function deleteAlbumImgur(id) {
    let albums = JSON.parse(localStorage.getItem("albumArray"))
    albums = albums.filter(function (obj) {
        return obj.id != id;
    });
    localStorage.removeItem(id)
    localStorage.setItem("albumArray", JSON.stringify(albums))
    $(`#${id}`).remove()
    M.toast({ html: `Album slettet` })


}

/**
 * Deletes a image from Imgur and locally
 * 
 * Denne metode er lavet af Johan & Benjamin
 * 
 * @param {String} imagehash hash of the image
 * @param {String} id id of the image
 */
async function deleteImage(imagehash, id) {
    try {
        var formdata = new FormData()
        formdata.append("ids[]", imagehash)
        const albumId = params.get("id")
        const albumHash = params.get("hash")
        const albumDeletion = await fetch(`https://api.imgur.com/3/album/${albumHash}/remove_images`, new makeHeaders('POST', formdata))
        const albumJson = await albumDeletion.json()
        const data = await fetch(`https://api.imgur.com/3/image/${imagehash}`, new makeHeaders('DELETE'))
        const json = await data.json()
        const cache = JSON.parse(localStorage.getItem(albumId))

        if (cache != null) {
            delete cache[id]
            localStorage.setItem(albumId, JSON.stringify(cache))
        }

        $(`#${imagehash}`).remove()
        M.toast({ html: `Billede slettet` })
    } catch (error) {
        console.error("error: " + error)
    }
}

/**
 * sets the current selected image id
 * 
 * @param {String} id id of the image
 */
function setImageCurrentId(id) {
    currentImageId = id
    setPredefinedText(false)

}

/**
 * Sets the ID of the album
 * 
 * @param {String} id id of the album
 */
function setAlbumCurrentId(id) {
    currentAlbumId = id
    setPredefinedText(true)
}

/**
 * Sets the current description and title text when editting new images and pictures
 * 
 * Denne metode er lavet af Jeppe & Nikolaj
 * 
 * @param {boolean} album is album or image
 */
function setPredefinedText(album) {
    if (album) {
        let albums = JSON.parse(localStorage.getItem("albumArray"))
        let album = albums.find(x => x.id == currentAlbumId)

        if (album.title) {
            setActive("albumImgTitle")
        }
        if (album.description) {
            setActive("albumImgDesc")
        }

        $(".title-text").val(album.title)
        $(".description-text").val(album.description)
    } else {
        let albumId = params.get("id")
        let cache = JSON.parse(localStorage.getItem(albumId))
        if (cache[currentImageId] != null) {
            $(".title-text").val(cache[currentImageId].title)
            $(".description-text").val(cache[currentImageId].description)

            setActive("imgTitle")
            setActive("imgDesc")
        }
    }
}

/**
 * Denne metode er lavet af Jeppe
 * 
 * @param {String} domID the assigned if for the dom 
 */
function setActive(domID) {
    let active = document.getElementById(domID)
    active.classList.add("active")
}

/**
 * Updates info on picture or album
 * 
 * Denne metode er lavet af Johan & Benjamin
 * 
 * @param {String} title the title of the album/picture
 * @param {String} description description for the album or picture
 * @param {boolean} album is album or image
 */
function updateInfo(title, description, album) {
    let currentHash = localStorage.getItem(currentImageId)
    if (album) {
        currentHash = currentAlbumId
        const albums = JSON.parse(localStorage.getItem("albumArray"))
        const obj = albums.find(x => x.id == currentAlbumId)
        const index = albums.indexOf(obj)
        obj.title = title ? title : "Ingen titel"
        obj.description = description ? description : "Ingen beskrivelse"
        albums[index] = obj
        localStorage.setItem("albumArray", JSON.stringify(albums))
    } else {
        let albumId = params.get("id")
        let cache = JSON.parse(localStorage.getItem(albumId))
        if (cache[currentImageId] != null) {
            cache[currentImageId].title = title ? title : "Ingen titel"
            cache[currentImageId].description = description ? description : "Ingen beskrivelse"            
            localStorage.setItem(albumId, JSON.stringify(cache))
        }
    }

    $(`#${currentHash} p:first`).html(description)
    $(`#${currentHash} .card-title:first`).html(title)
    M.toast({ html: `${(album) ? 'Album' : 'Billede'} opdateret` })
}

