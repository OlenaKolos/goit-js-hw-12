import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import alertImg from '/img/alert.svg';
import axios from 'axios';

const form = document.querySelector('.form');
const getMoreBtn =
  document.querySelector('.get-more-btn') || document.createElement('button');

const photoLoader = {
  url: 'https://pixabay.com/api/',
  searchParams: {
    key: '40878457-91c7c8077e8a58c5727309d44',
    q: '',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: 1,
  },
  searchPhotosBtn: document.querySelector('.search-btn'),
  searchTerm: document.querySelector('.searchTerm'),
  loader: document.querySelector('.loader'),
  gallery: document.querySelector('.gallery'),
  totalHits: 0,

  simpleGallery: new SimpleLightbox('.gallery a', {
    overlayOpacity: 0.8,
    captionsData: 'alt',
    captionDelay: 250,
  }),

  startSearch(event) {
    event.preventDefault();
    if (this.searchTerm.value.trim().length < 3) {
      this.showAlert('Please, enter search term!');
      return;
    }
    this.gallery.innerHTML = '';
    this.searchParams.q = this.searchTerm.value.trim();
    this.searchParams.page = 1;
    this.fetchPhotos();
  },

  loadMorePhotos() {
    this.searchParams.page += 1;
    this.fetchPhotos();
  },

  renderPhotos(photos) {
    if (photos.total === 0) {
      this.showAlert(
        'Sorry, there are no images matching your search query. Please try again!'
      );
      this.showLoaderAndButtons(false);
      return;
    }
    this.totalHits = photos.totalHits;
    const markup = photos.hits
      .map(photo => {
        return `<a class="gallery-link" href="${photo.largeImageURL}">
                <span class="gallery-item"><img class="gallery-image" src="${photo.webformatURL}" alt="${photo.tags}" title="${photo.tags}" /></span>
                <span class="img-stat">
                <span class="img-stat-item"><span class="img-stat-title">Likes</span><span class="img-stat-val">${photo.likes}</span></span>
                <span class="img-stat-item"><span class="img-stat-title">Views</span><span class="img-stat-val">${photo.views}</span></span>
                <span class="img-stat-item"><span class="img-stat-title">Comments</span><span class="img-stat-val">${photo.comments}</span></span>
                <span class="img-stat-item"><span class="img-stat-title">Downloads</span><span class="img-stat-val">${photo.downloads}</span></span>
                </span>
                </a>`;
      })
      .join('');
    this.gallery.insertAdjacentHTML('beforeend', markup);
    this.simpleGallery.refresh();
    this.scrollTop();
  },

  scrollTop() {
    if (this.searchParams.page > 1) {
      const rect = document
        .querySelector('.gallery-link')
        .getBoundingClientRect();
      window.scrollBy({ top: rect.height * 2, left: 0, behavior: 'smooth' });
    }
  },

  showLoaderAndButtons(state = true) {
    this.loader.style.display = !state ? 'none' : 'inline-block';
    getMoreBtn.style.display = !state ? 'block' : 'none';
    this.searchPhotosBtn.disabled = state;
    if (state === false) {
      if (this.searchParams.page === 1 && this.totalHits > 1) {
        getMoreBtn.style.display = 'block';
      }
      if (
        Math.ceil(this.totalHits / this.searchParams.per_page) ===
        this.searchParams.page
      ) {
        getMoreBtn.style.display = 'none';
        this.showAlert(
          "We're sorry, but you've reached the end of search results."
        );
      }
    }
  },

  showAlert(msg) {
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
  },

  async fetchPhotos() {
    this.showLoaderAndButtons();
    try {
      const response = await axios.get(this.url, { params: this.searchParams });
      this.renderPhotos(response.data);
    } catch (error) {
      this.showAlert(error.message);
    }
    this.showLoaderAndButtons(false);
  },
};

form.addEventListener('submit', event => photoLoader.startSearch(event));

if (getMoreBtn) {
  getMoreBtn.addEventListener('click', () => photoLoader.loadMorePhotos());
}
