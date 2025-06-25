// $('.search-button').on('click', function(){
//   $.ajax({
//       url:'http://www.omdbapi.com/?apikey=7d715cb3&s=' + $('.input-keyword').val(),
//       success: result=>{
//           const movies= result.Search;
//           let cards='';
//   movies.forEach(m => {
//       cards += showCards(m);
//   });
//   $('.movie-container').html(cards);

//   // ketika modal di klik
//   $('.modal-detail-button').on('click', function(){
//       console.log($(this).data('imdbid'));
//       $.ajax({
//           url:'http://www.omdbapi.com/?apikey=7d715cb3&i=' + $(this).data('imdbid'),
//           success: m=>{
//               const movieDetail= showMovieDetail(m);
//             $('.modal-body').html(movieDetail);
//           },
//           error: (e)=>{
//               console.log(e.responseText);
//           }
//       });

//   });
//       },
//       error: (e)=>{
//           console.log(e.responseText);
//       }
//   });

// });


// // menggunakan fetch
// const searchButton= document.querySelector('.search-button');
// searchButton.addEventListener('click', function(){

//   const inputKeyword= document.querySelector('.input-keyword');
//   fetch('http://www.omdbapi.com/?apikey=7d715cb3&s=' + inputKeyword.value)
//     .then(response=> response.json())
//     .then(response=> {
//       let movies= response.Search;
//       let cards='';
//       movies.forEach(m => {
//         cards+= showCards(m);
//         const movieContainer= document.querySelector('.movie-container');
//         movieContainer.innerHTML=cards;

//         // ketika tombol di klik
//          const modalDetailButton= document.querySelectorAll('.modal-detail-button');
//          modalDetailButton.forEach(btn=>{
//           btn.addEventListener('click', function(){
//             const imdbId= this.dataset.imdbid;
//             fetch('http://www.omdbapi.com/?apikey=7d715cb3&i=' + imdbId)
//               .then(response=> response.json())
//               .then(m=>{
//                 const movieDetail= showMovieDetail(m);
//                 const modalBody= document.querySelector('.modal-body');
//                 modalBody.innerHTML= movieDetail;
//               });
//           });
//          });

//       });
//     });
// });


// fetch refactoring
// getMovies function yang berisikan fetch dan isi dari keyword
// update ui berisikan card yang akan di tampilkan di continer
const URL_ALL_MOVIE = 'https://www.omdbapi.com/?apikey=7d715cb3&s=';
const URL_MOVIE_DETAIL = 'https://www.omdbapi.com/?apikey=7d715cb3&i=';

const searchButton = document.querySelector('.search-button');
const inputKeyword = document.querySelector('.input-keyword');

// Event ketika tombol cari diklik
searchButton.addEventListener('click', async function () {
  try {
    const movies = await getMovies(inputKeyword.value);
    updateUI(movies);
  } catch (err) {
    alert(err);
  }
});

// Event ketika menekan tombol Enter di input
inputKeyword.addEventListener('keyup', async function (e) {
  if (e.code === "Enter") {
    try {
      const movies = await getMovies(inputKeyword.value);
      updateUI(movies);
    } catch (err) {
      alert(err);
    }
  }
});

function getMovies(keyword) {
  return fetch(URL_ALL_MOVIE + keyword)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(response => {
      if (response.Response === "False") {
        throw new Error(response.Error);
      }
      return response.Search;
    });
}

function updateUI(movies) {
  const movieContainer = document.querySelector('.movie-container');

  if (!Array.isArray(movies) || movies.length === 0) {
    movieContainer.innerHTML = `<p class="text-center text-muted">Tidak ada data ditemukan atau Anda sedang offline.</p>`;
    return;
  }

  let cards = '';
  movies.forEach(m => cards += showCards(m));
  movieContainer.innerHTML = cards;
}


// Cache fallback logic
let networkDataReceived = false;
const networkUpdate = fetch(URL_ALL_MOVIE + "batman") // contoh keyword default
  .then(response => response.json())
  .then(movies => {
    networkDataReceived = true;
    updateUI(movies.Search);
  });

// return movies from cache
caches.match(URL_ALL_MOVIE + "batman").then(function (response) {
  if (!response) throw new Error("No cache found");
  return response.json();
}).then(function (movies) {
  if (!networkDataReceived) {
    updateUI(movies.Search);
    console.log("Movies from cache");
  }
}).catch(function () {
  return networkUpdate;
});

// Event binding tombol detail
document.addEventListener('click', async function (e) {
  if (e.target.classList.contains('modal-detail-button')) {
    const imdbid = e.target.dataset.imdbid;
    const movieDetail = await getMovieDetail(imdbid);
    updateDetail(movieDetail);
  }
});

function getMovieDetail(imdbid) {
  return fetch(URL_MOVIE_DETAIL + imdbid)
    .then(response => response.json());
}

function updateDetail(m) {
  const movieDetail = showMovieDetail(m);
  const modalBody = document.querySelector('.modal-body');
  modalBody.innerHTML = movieDetail;
}

function showCards(m) {
  return `<div class="col-md-4 mt-3">
    <div class="card">
      <img src="${m.Poster}" class="card-img-top">
      <div class="card-body">
        <h5 class="card-title">${m.Title}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${m.Year}</h6>
        <a href="#" class="btn btn-primary modal-detail-button" data-bs-toggle="modal" data-bs-target="#movieModal" data-imdbid="${m.imdbID}">Show detail</a>
      </div>
    </div>
  </div>`;
}

function showMovieDetail(m) {
  return `<div class="container-fluid">
    <div class="row">
      <div class="col-md-3">
        <img src="${m.Poster}" class="img-fluid">
      </div>
      <div class="col-md">
        <ul class="list-group">
          <li class="list-group-item"><h4>${m.Title} (${m.Year})</h4></li>
          <li class="list-group-item"><strong>Director:</strong> ${m.Director}</li>
          <li class="list-group-item"><strong>Actors:</strong> ${m.Actors}</li>
          <li class="list-group-item"><strong>Writer:</strong> ${m.Writer}</li>
          <li class="list-group-item"><strong>Plot:</strong><br>${m.Plot}</li>
        </ul>
      </div>
    </div>
  </div>`;
}

// Register Service Worker
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        console.log("Service worker active");
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

registerServiceWorker();


