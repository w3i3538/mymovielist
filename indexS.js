const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIE_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  //   80/12=6...8 =>7
  //   Math.ceil無條件進位
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

//目的在顯示第幾頁會出現哪些電影
function getMoviesByPage(page) {
  //p1 -> 0~11
  //p2 -> 12~23
  //p3 -> 24~35
  //...
  //分頁中使用的movies參數可能是"movies"也可能是"filtermovies"

  //這段是，if filteredMovies.length===1(ture)則用filtermovie，(0)否(false)則movies
  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * MOVIE_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE)
}


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(respense => {
    //respense.data.results
    const data = respense.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`

  })

}

function addToFavorite(id) {
  //如果取不到會取到[]
  //localStorage只能存字串
  //Json.parse會將資料轉為類JS的物件或陣列(物件)
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // function isMovieIdMatched(movie) {
  //   return movie.id === id
  // }
  // const movie = movies.find(isMovieIdMatched)
  //find和filter都是將函示當作參數，如果true就return
  //上下效果相等 只是改寫成箭頭函式
  const movie = movies.find((movie) => movie.id === id)

  //some只想知道陣列有沒有這元素
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)

  //JSON字串
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }

})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //'A' =>  <a></a>
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

//監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()


  // if (!keyword.length) {
  //   return alert('Please enter a valid string')
  // }

  //map, filter, reduce 好用
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  // 這兩段是一樣結果，上段是用filter函式 true就會return
  // for (const movie of movies){
  //   if (movie.title.toLowerCase().includes(keyword)){
  //     filteredMovies.push(movie)
  //   }
  // }

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))

})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

