const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIE_PER_PAGE = 12;

const movies = [];
let filteredMovies = [];
let pagemode = "card";
let page = 1;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const switchMode = document.querySelector("#switch-mode");

//渲染電影列表
function renderMovieList(data) {
    let rawHTML = "";

    if (pagemode === "card") {
        data.forEach((item) => {
            rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
        });
    } else if (pagemode === "list") {
        rawHTML += `<ul class="list-group col-12 mb-3">`
        data.forEach((item) => {
            rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
      <h5 class="card-title">${item.title}</h5>
      <div>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>`
        });

        rawHTML += `</ul>`
    }

    dataPanel.innerHTML = rawHTML;
}

//渲染分頁函式
function renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE);
    let rawHTML = "";

    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
    }

    paginator.innerHTML = rawHTML;
}

//第幾頁會出現哪些電影
function getMoviesByPage(page) {
    const data = filteredMovies.length ? filteredMovies : movies;
    const startIndex = (page - 1) * MOVIE_PER_PAGE;
    return data.slice(startIndex, startIndex + MOVIE_PER_PAGE);
}

//渲染詳細資料函式
function showMovieModal(id) {
    const modalTitle = document.querySelector("#movie-modal-title");
    const modalImage = document.querySelector("#movie-modal-image");
    const modalDate = document.querySelector("#movie-modal-date");
    const modalDescription = document.querySelector("#movie-modal-description");

    axios.get(INDEX_URL + id).then((respense) => {
        const data = respense.data.results;
        modalTitle.innerText = data.title;
        modalDate.innerText = "Release date: " + data.release_date;
        modalDescription.innerText = data.description;
        modalImage.innerHTML = `<img src="${POSTER_URL + data.image
            }" alt="movie-poster" class="img-fluid">`;
    });
}

//加入最愛列表函式
function addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
    const movie = movies.find((movie) => movie.id === id);

    if (list.some((movie) => movie.id === id)) {
        return alert("此電影已經在收藏清單中！");
    }
    list.push(movie);

    localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

//監聽switchmode中兩個按鈕
switchMode.addEventListener("click", function onSwitchClicked(event) {
    if (event.target.matches("#card-mode-button")) {
        pagemode = "card";
        renderMovieList(getMoviesByPage(page));
    } else if (event.target.matches("#list-mode-button")) {
        pagemode = "list";
        renderMovieList(getMoviesByPage(page));
    }
});

//監聽search - input btn
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
    event.preventDefault();
    const keyword = searchInput.value.trim().toLowerCase();

    filteredMovies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword)
    );

    if (filteredMovies.length === 0) {
        return alert("Cannot find movies with keyword: " + keyword);
    }
    page = 1;
    renderPaginator(filteredMovies.length);
    renderMovieList(getMoviesByPage(page));
});

//監聽詳細資料.最愛按鈕
dataPanel.addEventListener("click", function onPanelClicked(event) {
    if (event.target.matches(".btn-show-movie")) {
        showMovieModal(Number(event.target.dataset.id));
    } else if (event.target.matches(".btn-add-favorite")) {
        addToFavorite(Number(event.target.dataset.id));
    }
});

//監聽分頁鈕
paginator.addEventListener("click", function onPaginatorClicked(event) {
    if (event.target.tagName !== "A") return;
    page = Number(event.target.dataset.page);

    renderMovieList(getMoviesByPage(page));
});

axios
    .get(INDEX_URL)
    .then((response) => {
        movies.push(...response.data.results);
        renderPaginator(movies.length);
        renderMovieList(getMoviesByPage(1));
    })
    .catch((err) => console.log(err));
