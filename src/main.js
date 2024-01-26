import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import alertImg from '/img/alert.svg';

const url = 'https://pixabay.com/api/';
const searchParams = {
  key: '41933677-6eee14a43ac3f23b8d77fa6f0',
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 18,
};

const form = document.querySelector('.form');
const searchTerm = document.querySelector('.searchTerm');
const searchPhotosBtn = document.querySelector('.search-btn');
const loader = document.querySelector('.loader');
const gallery = document.querySelector('.gallery');

const simpleGallery = new SimpleLightbox('.gallery a', {
  overlayOpacity: 0.8,
  captionsData: 'alt',
  captionDelay: 250,
});

if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (searchTerm.value.trim().length < 3) {
      showAlert('Please, enter search term!');
      return;
    }
    fetchPhotos()
      .then(photos => renderPhotos(photos))
      .catch(error => showAlert(error.toString()));
  });
} else {
  console.error('Element with class .form not found');
}

function fetchPhotos() {
  gallery.textContent = '';
  showLoader(true);
  searchParams.q = searchTerm.value.trim();
  const searchParamsString = new URLSearchParams(searchParams);
  return fetch(`${url}?${searchParamsString}`).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    try {
      return response.json();
    } catch (error) {
      throw new Error('Failed to parse JSON');
    }
  });
}

function renderPhotos(photos) {
  if (photos.total === 0) {
    showAlert(
      'Sorry, there are no images matching your search query. Please try again!'
    );
    showLoader(false);
    return;
  }
  const markup = photos.hits
    .map(photo => {
      return `<a class="gallery-link" href="${photo.largeImageURL}"><span class="gallery-item"><img class="gallery-image" src="${photo.webformatURL}" alt="${photo.tags}" title="${photo.tags}" /></span>
            <span class="img-stat">
            <span class="img-stat-item"><span class="img-stat-title">Likes</span><span class="img-stat-val">${photo.likes}</span></span>
            <span class="img-stat-item"><span class="img-stat-title">Views</span><span class="img-stat-val">${photo.views}</span></span>
            <span class="img-stat-item"><span class="img-stat-title">Comments</span><span class="img-stat-val">${photo.comments}</span></span>
            <span class="img-stat-item"><span class="img-stat-title">Downloads</span><span class="img-stat-val">${photo.downloads}</span></span>
            </span>
            </a>`;
    })
    .join('');
  showLoader(false);
  gallery.insertAdjacentHTML('beforeend', markup);
  simpleGallery.refresh();
}

function showLoader(state = true) {
  loader.style.display = !state ? 'none' : 'inline-block';
  searchPhotosBtn.disabled = state;
}

function showAlert(msg) {
  iziToast.show({
    position: 'center',
    iconUrl: alertImg,
    messageColor: '#FAFAFB',
    messageSize: '16px',
    backgroundColor: '#EF4040',
    close: false,
    closeOnClick: true,
    message: msg,
  });
}
