const urlParams = new URLSearchParams(window.location.search);

// runs when the document is ready
$(document).ready(function () {
  $('.collapsible').collapsible();
  $('.modal').modal();
  $('.materialboxed').materialbox();
  $('.dropdown-trigger').dropdown();
  $('input#albumTitel, textarea#albumDisc, input#albumTitel, textarea#albumDisc, input#changeAlbumTitle, textarea#changeAlbumDesc, input#changeImageTitle, textarea#changeImageDesc').characterCounter();
  $('.fixed-action-btn').floatingActionButton({
    direction: 'left',
    hoverEnable: false
  });
  $("#imageForm").submit(function (e) {
    e.preventDefault();
  });
  document.addEventListener('keyup', (e) => {
    if (e.code === "ArrowLeft") openAdjacent(-1)
    else if (e.code === "ArrowRight") openAdjacent(1)
  });
});

/**
 * Creates a new album
 * 
 * Lavet af Nikolaj og Daniel
 */
function createAlbum() {
  const title = $('#albumTitel').val()
  const desc = $('#albumDisc').val()
  createAlbumImgur(title, desc)
}

/**
 * Initialize everything for the landing page
 * 
 * Lavet af Nikolaj og Daniel
 */
async function initIndex() {
  await initThemes()
  fetchAlbumsImgur()
  M.updateTextFields();
}

/**
 * Initialize everything for the album page
 * 
 * Lavet af Nikolaj, Daniel & Jeppe
 */
async function initAlbum() {
  await initThemes()
  const id = urlParams.get('id')
  const albums = JSON.parse(localStorage.getItem("albumArray"))
  const album = albums.find(x => x.id == id)
  if (album.title.length == 0) album.title = "Ingen titel"
  if (album.description.length == 0) album.description = "Ingen beskrivelse"
  $("#album-title").html(album.title)
  $("#albumDescription").html(album.description)
  fetchAlbumImages(id)
}

/**
 * Creates a image from upload
 * 
 * Lavet af Nikolaj og Daniel
 */
async function addImage() {
  const file = document.querySelector("#fileInput").files[0]
  const title = $('#albumTitel').val()
  const desc = $('#albumDisc').val()
  const image = await toBase64(file)
  const hash = urlParams.get('hash');
  const id = urlParams.get('id');
  uploadImage(image, hash, id, title, desc)
}

/**
 * Makes a fetch header
 * 
 * Denne funktion er skrevet af Jeppe og Johan
 * 
 * @param {String} method the method to perform in the fetch
 * @param {FormData} body the data of the header
 */
function makeHeaders(method, body) {
  this.method = method
  this.headers = {
    Authorization: `Client-ID ${clientId}`
  }

  this.redirect = 'follow'
  if (method != 'GET') {
    this.body = body
  }
}

/**
 * Opens a image in a Materialbox
 * 
 * Denne funktion er skrevet af Johan, Jeppe og Benjamin
 * 
 * @param {Image} image the image to open
 * @param {String} title the title of the image
 * @param {String} description the description of the image
 * @param {String} id id of the image
 */
function openImage(image, title, description, id) {
  $("#imagePopUp").empty()
  $("#imagePopUp").append(`
  <img id="${id}" class="materialboxed" data-caption="${title} - ${description}" width="1" src="${image}">`)
  $('.materialboxed').materialbox({
    onCloseEnd: () => {
      $("#imagePopUp").empty()

    }, onCloseStart: () => {
      $('.arrow').css("visibility", "hidden")
    }
  });
  var instance = M.Materialbox.getInstance($(`#${id}`));
  $('.arrow').css("visibility", "visible")
  instance.open()
  currentPos = images.map((obj) => {
    return obj.id
  }).indexOf(id)
}

/**
 * Opens a image adjacent to the current image
 * 
 * Denne funktion er skrevet af Benjamin og Johan
 * 
 * @param {Number} num how many images to skip
 */
function openAdjacent(num) {
  if (currentPos + num >= 0 && currentPos + num < images.length) {
    $("#imagePopUp").empty()
    $(".materialbox-caption").remove()
    const image = new Image()
    image.onload = () => {
      $("#imagePopUp").append(image)
      $('.materialboxed').materialbox({
        inDuration: 1, onCloseEnd: () => {
          $("#imagePopUp").empty()

        }, onCloseStart: () => {
          $('.arrow').css("visibility", "hidden")
        }
      });
      var instance = M.Materialbox.getInstance($(`#${images[currentPos + num].id}`));
      $('.arrow').css("visibility", "visible")
      instance.open()
      currentPos += num
    }
    image.width = 1
    image.src = `https://i.imgur.com/${images[currentPos + num].id}.jpeg`
    image.id = `${images[currentPos + num].id}`
    image.setAttribute("data-caption", `${images[currentPos + num].title} - ${images[currentPos + num].description}`)

    image.classList.add("materialboxed")
  }
}

/**
 * Deletes a album from Imgur and locally
 * 
 * Lavet af Nikolaj og Daniel
 */
function deleteAlbum(insideAlbum) {
  if (insideAlbum) {
    deleteAlbumImgur(urlParams.get('id'))
    window.location.href="../index.html"
  } else {
    deleteAlbumImgur(currentAlbumId)
  }
}

/**
 * Deletes an image from Imgur and locally
 * 
 * Lavet af Nikolaj
 */
function deleteItem() {
  deleteImage(localStorage.getItem(currentImageId), currentImageId)
}

/**
 * Toggles the option to delete images
 * 
 * Denne metode er lavet af Jeppe, Johan & Benjamin
 */
function toggleDelete() {
  $(".editButton").css("visibility", "hidden")

  if ($(".deleteButton").css("visibility") == "hidden") {
    $(".deleteButton").css("visibility", "visible")
  } else {
    $(".deleteButton").css("visibility", "hidden")
  }
}

/**
 * Toggles the option to edit pictures
 * 
 * Denne metode er lavet af Jeppe, Johan & Benjamin
 */
function toggleEdit() {
  $(".deleteButton").css("visibility", "hidden")

  if ($(".editButton").css("visibility") == "hidden") {
    $(".editButton").css("visibility", "visible")
  } else {
    $(".editButton").css("visibility", "hidden")
  }
}

/**
 * Initialize settings
 * 
 * Lavet af Nikolaj og Daniel
 */
function initSettings() {
  initThemes()

  document.getElementById('imageTitle').checked = localStorage.getItem("imageTitleChecked") == "true"
  document.getElementById('albumTitle').checked = localStorage.getItem("albumTitleChecked") == "true"

}

/**
 * Changes the information on images
 * 
 * Denne metode er lavet af Jeppe, Johan & Benjamin
 */
function updateImage() {
  const title = $('#changeImageTitle').val()
  const desc = $('#changeImageDesc').val()
  updateInfo(title, desc, false)
}

/**
 * Changes the information on albums
 * 
 * Denne metode er lavet af Jeppe, Johan & Benjamin
 */
function updateAlbum() {
  const title = $('#changeAlbumTitle').val()
  const desc = $('#changeAlbumDesc').val()
  updateInfo(title, desc, true)
}