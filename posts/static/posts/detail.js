console.log('hello world detail')
const postBox = document.getElementById('post-box')
const alertBox = document.getElementById("alert-box")
const backBtn = document.getElementById('back-btn')
const updateBtn = document.getElementById('update-btn')
const deleteBtn = document.getElementById('delete-btn')

const url = window.location.href + "data/"
const updateUrl = window.location.href + "update/"
const deleteUrl = window.location.href + "delete/"

const updateForm = document.getElementById('update-form')
const deleteForm = document.getElementById('delete-form')

const spinnerBox = document.getElementById('spinner-box')

const titleInput = document.getElementById('id_title')
const bodyInput = document.getElementById('id_body')

const csrf = document.getElementsByName('csrfmiddlewaretoken')

const postId = window.location.pathname.split('/')[1]

backBtn.addEventListener('click', () => {
    history.back()
})

$.ajax({
    type: 'GET',
    url: url,
    success: function (response) {
        console.log(response)
        const data = response.data

        if (data.logged_in !== data.author) {
            console.log('different')
        } else {
            console.log('the same')
            updateBtn.classList.remove('not-visible')
            deleteBtn.classList.remove('not-visible')
        }

        const titleEl = document.createElement('h3')
        titleEl.setAttribute('class', 'mt-3')
        titleEl.setAttribute('id', 'title')

        const bodyEl = document.createElement('p')
        bodyEl.setAttribute('class', 'mt-1')
        bodyEl.setAttribute('id', 'body')

        titleEl.textContent = data.title
        bodyEl.textContent = data.body

        postBox.appendChild(titleEl)
        postBox.appendChild(bodyEl)

        titleInput.value = data.title
        bodyInput.value = data.body

        spinnerBox.classList.add('not-visible')
    },
    error: function (error) {
        console.log(error)
    }
})

updateForm.addEventListener('submit', e => {
    e.preventDefault()

    const title = document.getElementById('title')
    const body = document.getElementById('body')

    $.ajax({
        type: 'POST',
        url: updateUrl,
        data: {
            'csrfmiddlewaretoken': csrf[0].value,
            'title': titleInput.value,
            'body': bodyInput.value,
        },
        success: function (response) {
            console.log(response)
            handleAlerts('success', 'post has been updated')
            title.textContent = response.title
            body.textContent = response.body
            window.location.reload()
        },
        error: function (error) {
            console.log(error)
        }
    })
})

deleteForm.addEventListener('submit', e => {
    e.preventDefault()

    $.ajax({
        type: 'POST',
        url: deleteUrl,
        data: {
            'csrfmiddlewaretoken': csrf[0].value,
        },
        success: function (response) {
            window.location.href = window.location.origin
            localStorage.setItem('title', titleInput.value)
        },
        error: function (error) {
            console.log(error)
        },
    })
})

Dropzone.autoDiscover = false
const dropzone = document.getElementById('my-dropzone')
if (dropzone) {
    const photosCount = parseInt(dropzone.getAttribute('data-photos'))
    const maxPhotos = parseInt(dropzone.getAttribute('data-max-photos'))
    let photosAdded = false
    const myDropzone = new Dropzone('#my-dropzone', {
        url: '/upload/',
        init: function () {
            this.on('sending', function (file, xhr, formData) {
                formData.append('csrfmiddlewaretoken', csrf[0].value)
                formData.append('new_post_id', postId)
            })
            this.on('success', function () {
                photosAdded = true
            })
            this.on('maxfilesexceeded', function (file) {
                this.removeFile(file)
                handleAlerts('danger', `a post can have max ${maxPhotos} photos in total`)
            })
        },
        maxFiles: maxPhotos - photosCount,
        parallelUploads: 1,
        maxFilesize: 4,
        acceptedFiles: '.png, .jpg, .jpeg'
    })

    // reload when the update window is closed, so the carousel shows the new photos
    document.getElementById('updateModal').addEventListener('hidden.bs.modal', () => {
        if (photosAdded) {
            window.location.reload()
        }
    })
}