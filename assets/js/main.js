/*!
 * main.js v4.1
 * javascript file for Sateula template
 * 
 * @license Copyright 2025, Sateula. All rights reserved.
 * Subject to the terms at sateula standard-license.
 * @author: xdarkshan, sateula
 */

// INJECT LICENSE ARTICLE DYNAMICALLY
const contentUrl = 'assets/license.txt';
const targetElementId = 'license-content-container';
const licenseLayer = document.getElementById('license');
const galleryLayer = document.getElementById('mygallery');

fetch(contentUrl)
	.then(response => {
		if (!response.ok) {
			throw new Error('failed to load: ' + response.statusText);
		}
		return response.text();
	})
	.then(textData => {
		const container = document.getElementById(targetElementId);
		if (container) {
			container.textContent = textData;
		}
	})
	.catch(error => {
		console.error('An error occurred while retrieving content:', error);
		document.getElementById(targetElementId).textContent = "failed to load license.";
	});

function showLayer(targetId) {
	const allLayers = [licenseLayer, galleryLayer];

	allLayers.forEach(layer => {
		layer.classList.remove('active');
	});

	document.getElementById(targetId).classList.add('active');
}

// Main JS
(function ($) {
	var $window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$footer = $('#footer'),
		$newbut = $('#newbut'),
		$backtup = $('#backtup'),

		$main = $('#main'),
		$main_articles = $main.children('article');

	breakpoints({
		xlarge: ['1281px', '1680px'],
		large: ['981px', '1280px'],
		medium: ['737px', '980px'],
		small: ['481px', '736px'],
		xsmall: ['361px', '480px'],
		xxsmall: [null, '360px']
	});

	$window.on('load', function () {
		if (window.location.hash) {
			history.replaceState(null, null, window.location.pathname);
		}

		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);
		const inigmb = document.querySelector('.inigmb');
		if (window.innerWidth <= 500) {
			inigmb.style.float = 'none';
			inigmb.style.display = 'unset';
		} else if (window.innerWidth >= 500) {
			inigmb.style.float = 'left';
			inigmb.style.display = 'flex';
		}
	});

	var $nav = $header.children('nav'),
		$nav_li = $nav.find('li');
	if ($nav_li.length % 2 == 0) {
		$nav.addClass('use-middle');
		$nav_li.eq(($nav_li.length / 2)).addClass('is-middle');

	}

	var delay = 325,
		locked = false;

	$main._show = function (id, initial) {
		var $article = $main_articles.filter('#' + id);
		if ($article.length == 0)
			return;

		if (locked || (typeof initial != 'undefined' && initial === true)) {
			$body.addClass('is-switching');
			$body.addClass('is-article-visible');
			$main_articles.removeClass('active');
			$header.hide();
			$footer.show();
			$newbut.hide();
			$backtup.show();
			$main.show();
			$article.show();
			$article.addClass('active');
			locked = false;
			setTimeout(function () {
				$body.removeClass('is-switching');
			}, (initial ? 1000 : 0));

			return;

		}
		locked = true;

		if ($body.hasClass('is-article-visible')) {
			var $currentArticle = $main_articles.filter('.active');
			$currentArticle.removeClass('active');

			setTimeout(function () {
				$currentArticle.hide();
				$article.show();

				setTimeout(function () {

					$article.addClass('active');

					$window
						.scrollTop(0)
						.triggerHandler('resize.flexbox-fix');

					setTimeout(function () {
						locked = false;
					}, delay);
				}, 25);
			}, delay);

		}
		else {
			$body
				.addClass('is-article-visible');

			setTimeout(function () {
				$header.hide();
				$footer.show();
				$newbut.hide();
				$backtup.show();

				$main.show();
				$article.show();
				setTimeout(function () {
					$article.addClass('active');
					$window
						.scrollTop(0)
						.triggerHandler('resize.flexbox-fix');

					setTimeout(function () {
						locked = false;
					}, delay);
				}, 25);
			}, delay);
		}
	};

	$main._hide = function (addState) {
		var $article = $main_articles.filter('.active');
		if (!$body.hasClass('is-article-visible'))
			return;

		if (typeof addState != 'undefined'
			&& addState === true)
			history.pushState(null, null, '#');

		if (locked) {
			$body.addClass('is-switching');
			$article.removeClass('active');
			$article.hide();
			$main.hide();
			$footer.show();
			$newbut.show();
			$backtup.hide();
			$header.show();
			$body.removeClass('is-article-visible');
			locked = false;
			$body.removeClass('is-switching');
			$window
				.scrollTop(0)
				.triggerHandler('resize.flexbox-fix');

			return;
		}

		locked = true;
		$article.removeClass('active');
		setTimeout(function () {
			$article.hide();
			$main.hide();
			$footer.show();
			$newbut.show();
			$backtup.hide();

			$header.show();
			setTimeout(function () {
				$body.removeClass('is-article-visible');
				$window
					.scrollTop(0)
					.triggerHandler('resize.flexbox-fix');
				setTimeout(function () {
					locked = false;
				}, delay);
			}, 25);
		}, delay);
	};

	$main_articles.each(function () {
		var $this = $(this);
		$('<div class="close"></div>')
			.appendTo($this)
			.on('click', function () {
				location.hash = '';
			});
		$this.on('click', function (event) {
			event.stopPropagation();
		});
	});

	$window.on('keyup', function (event) {
		switch (event.keyCode) {
			case 27:
				if ($body.hasClass('is-article-visible'))
					$main._hide(true);
				break;
			default:
				break;
		}
	});

	$window.on('hashchange', function (event) {
		if (location.hash == ''
			|| location.hash == '#') {
			event.preventDefault();
			event.stopPropagation();
			$main._hide();
		}

		else if ($main_articles.filter(location.hash).length > 0) {
			event.preventDefault();
			event.stopPropagation();
			$main._show(location.hash.substr(1));
		}
	});

	if ('scrollRestoration' in history)
		history.scrollRestoration = 'manual';

	if (window.location.hash) {
		history.replaceState(null, null, window.location.pathname + window.location.search);
	}

	$main.hide();
	$main_articles.hide();
	$backtup.hide();

	if (location.hash != ''
		&& location.hash != '#')
		$window.on('load', function () {
			$main._show(location.hash.substr(1), true);
		});
})(jQuery);

$(function () {
	if (window.location.hash) {
		history.replaceState(null, null, window.location.pathname + window.location.search);
	}
});

function btme() {
	document.location.href = "itsme.html";
}
function jny() {
	document.location.href = "myjourney.html";
}

// MUSIC PLAYER JS (279-718)
let songIndex = 0;
let isLocked = false;
let songsLength = null;
let selectedSong = null;
let loadingProgress = 0;
let isPlayed = false;
let progress_elmnt = null;
let songName_elmnt = null;
let sliderImgs_elmnt = null;
let singerName_elmnt = null;
let progressBar_elmnt = null;
let playlistSongs_elmnt = [];
let loadingProgress_elmnt = null;
let musicPlayerInfo_elmnt = null;
let progressBarIsUpdating = false;
let broadcastGuarantor_elmnt = null;
const root = querySelector("#root");
const PLAYLIST_SVG_ICON = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6H14M20 10H14M20 14H12M20 18H4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
    <path d="M8 12C8 13.1046 7.10457 14 6 14C4.89543 14 4 13.1046 4 12C4 10.8954 4.89543 10 6 10C7.10457 10 8 10.8954 8 12ZM8 12V7M8 7H10V6H8V7Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
`;

function App({ songs }) {
	function handleChangeMusic({ isPrev = false, playListIndex = null }) {
		if (isLocked || songIndex === playListIndex) return;

		if (playListIndex || playListIndex === 0) {
			songIndex = playListIndex;
		} else {
			songIndex = isPrev ? songIndex -= 1 : songIndex += 1;
		}

		if (songIndex < 0) {
			songIndex = 0;
			return;
		} else if (songIndex > songsLength) {
			songIndex = songsLength;
			return;
		}

		selectedSong.pause();
		selectedSong.currentTime = 0;
		progressBarIsUpdating = false;
		selectedSong = playlistSongs_elmnt[songIndex];

		if (selectedSong.paused && isPlayed) selectedSong.play(); else
			selectedSong.pause();

		setBodyBg(songs[songIndex].bg);
		setProperty(sliderImgs_elmnt, "--index", -songIndex);

		updateInfo(songName_elmnt, songs[songIndex].songName);

		updateInfo(singerName_elmnt, songs[songIndex].artist);

		if (isPlayed) {
			broadcastGuarantor_elmnt.classList.add("click");
		} else {
			broadcastGuarantor_elmnt.classList.remove("click");
		}
	}

	setBodyBg(songs[0].bg);

	return (
		dom("div", { class: "music-player flex-column" },
			dom(Slider, { slides: songs, handleChangeMusic: handleChangeMusic }),
			dom(Playlist, { list: songs, handleChangeMusic: handleChangeMusic })));


}

function Slider({ slides, handleChangeMusic }) {
	function handleResizeSlider({ target }) {
		if (isLocked) {
			return;
		} else if (target.classList.contains("music-player__info")) {
			this.classList.add("resize");
			setProperty(this, "--controls-animate", "down running");
			return;
		} else if (target.classList.contains("music-player__playlist-button")) {
			this.classList.remove("resize");
			setProperty(this, "--controls-animate", "up running");
			return;
		}
	}
	function handlePlayMusic() {
		if (selectedSong.currentTime === selectedSong.duration) {
			handleChangeMusic({});
		}

		this.classList.toggle("click");
		isPlayed = !isPlayed;
		selectedSong.paused ? selectedSong.play() : selectedSong.pause();
	}

	return (
		dom("div", { class: "slider center", onClick: handleResizeSlider },
			dom("div", { class: "slider__content center" },
				dom("button", { class: "music-player__playlist-button center button" },
					dom("button", {
						class: "music-player__playlist-button center button",
						ref: "playlistButton",
					},
						dom("img", {
							class: "music-player__playlist-button center button",
							style: { width: "inherit" },
							src: "images/property/playlist.png",
						})
					)),

				dom("button", {
					onClick: handlePlayMusic,
					class: "music-player__broadcast-guarantor center button"
				},
					dom("i", { class: "icon-play" },
						dom("img", {
							class: "music-player__broadcast-guarantor center button",
							style: { position: "static", width: "90%", height: "90%" },
							src: "images/property/play.png",
						})
					),

					dom("i", { class: "icon-pause" },
						dom("img", {
							class: "music-player__broadcast-guarantor center button",
							style: { position: "static", width: "90%", height: "90%" },
							src: "images/property/pause.png",
						})

					)),

				dom("div", { class: "slider__imgs flex-row" },
					slides.map(({ songName, files: { cover } }) =>
						dom("img", { src: cover, class: "img", alt: songName })))),



			dom("div", { class: "slider__controls center" },
				dom("button", {
					class: "slider__switch-button flex-row button",
					onClick: () => handleChangeMusic({ isPrev: true })
				},

					dom("i", { class: "icon-back" },
						dom("img", {
							class: "icon-back",
							style: { position: "static", width: "60%", height: "60%" },
							src: "images/property/previous.png",
						})
					)),


				dom("div", { class: "music-player__info text_trsf-cap" },
					dom("div", { class: "music-player__singer-name" },
						dom("span", null, slides[0].artist)),

					dom("div", { class: "music-player__subtitle" },
						dom("span", null, slides[0].songName))),


				dom("button", {
					class: "slider__switch-button flex-row button",
					onClick: () => handleChangeMusic({ isPrev: false })
				},

					dom("i", { class: "icon-next" },
						dom("img", {
							class: "icon-next",
							style: { position: "static", width: "60%", height: "60%" },
							src: "images/property/next.png",
						})
					)),

				dom("div", {
					class: "progress center",
					onPointerdown: e => {
						handleScrub(e);
						progressBarIsUpdating = true;
					}
				},

					dom("div", { class: "progress__wrapper" },
						dom("div", { class: "progress__bar center" }))))));

}

function Playlist({ list, handleChangeMusic }) {
	function loadedAudio() {
		const duration = this.duration;
		const target = this.parentElement.querySelector(
			".music-player__song-duration");


		let min = parseInt(duration / 60);
		if (min < 10) min = "0" + min;

		let sec = parseInt(duration % 60);
		if (sec < 10) sec = "0" + sec;

		target.appendChild(document.createTextNode(`${min}:${sec}`));
	}

	function updateTheProgressBar() {
		const duration = this.duration;
		const currentTime = this.currentTime;

		const progressBarWidth = currentTime / duration * 100;
		setProperty(progressBar_elmnt, "--width", `${progressBarWidth}%`);

		if (isPlayed && currentTime === duration && songIndex < songsLength) {
			handleChangeMusic({});
		}

		if (
			songIndex === songsLength &&
			this === selectedSong &&
			currentTime === duration
		) {
			isPlayed = false;
			broadcastGuarantor_elmnt.classList.remove("click");
		}
	}

	return (
		dom("ul", { class: "music-player__playlist list" },
			list.map(({ songName, artist, files: { cover, song } }, index) => {
				return (
					dom("li", {
						class: "music-player__song",
						onClick: () =>
							handleChangeMusic({ isPrev: false, playListIndex: index })
					},


						dom("div", { class: "flex-row _align_center" },
							dom("img", { src: cover, class: "img music-player__song-img" }),
							dom("div", { class: "music-player__playlist-info  text_trsf-cap" },
								dom("b", { class: "text_overflow" },
									songName ? songName : "Unknown Title"
								), dom("div", { class: "flex-row _justify_space-btwn" },
									dom("span", { class: "music-player__subtitle" }, artist),
									dom("span", { class: "music-player__song-duration" })))),

						dom("audio", {
							src: song,
							onLoadeddata: loadedAudio,
							onTimeupdate: updateTheProgressBar
						})));

			})));

}

function dom(tag, props, ...children) {
	if (typeof tag === "function") return tag(props, ...children);

	function addChild(parent, child) {
		if (Array.isArray(child)) {
			child.forEach(nestedChild => addChild(parent, nestedChild));
		} else {
			parent.appendChild(
				child.nodeType ? child : document.createTextNode(child.toString()));

		}
	}

	const element = document.createElement(tag);

	Object.entries(props || {}).forEach(([name, value]) => {
		if (name.startsWith("on") && name.toLowerCase() in window) {
			element[name.toLowerCase()] = value;
		} else if (name === "style") {
			Object.entries(value).forEach(([styleProp, styleValue]) => {
				element.style[styleProp] = styleValue;
			});
		} else {
			element.setAttribute(name, value.toString());
		}
	});

	children.forEach(child => {
		addChild(element, child);
	});

	return element;
}

// song data, you can add more songs here!--shantan..xdarkshan..sateula
const songs = [
	{
		songName: "Elegi Esok Pagi",
		artist: "Adera, Ebiet G Ade, Segara",
		bg: "#f3e1d1",
		files: {
			cover: "images/music/elegi.jpg",
			song: 'music/elegiesokpagi.mp3'
		}
	},
	{
		songName: "You'll be in my heart",
		artist: "NIKI",
		bg: "#f3e1d1",
		files: {
			cover: "images/music/bemyheart.jpg",
			song: 'music/bemyheart.mp3'
		}
	},
	{
		songName: "That's so true",
		artist: "Gracie Abrams",
		bg: "#f3e1d1",
		files: {
			cover: "images/music/sotrue.jpg",
			song: 'music/sotrue.mp3'
		}
	},
	{
		songName: "Belai",
		artist: "Bunga & Amsyar Lee",
		bg: "#f3e1d1",
		files: {
			cover: "images/music/belai.jpg",
			song: 'music/belai.mp3'
		}
	},
	{
		songName: "Replay",
		artist: "Iyaz",
		bg: "#f3e1d1",
		files: {
			cover: "images/music/replay.jpg",
			song: 'music/replay.mp3'
		}
	}
];
const data = songs;

root.appendChild(dom(App, { songs: data }));

songsLength = data.length - 1;
progress_elmnt = querySelector(".progress");
playlistSongs_elmnt = querySelectorAll("audio");
sliderImgs_elmnt = querySelector(".slider__imgs");
songName_elmnt = querySelector(".music-player__subtitle");
musicPlayerInfo_elmnt = querySelector(".music-player__info");
singerName_elmnt = querySelector(".music-player__singer-name");
selectedSong = playlistSongs_elmnt[songIndex];
progressBar_elmnt = querySelector(".progress__bar");
broadcastGuarantor_elmnt = querySelector(
	".music-player__broadcast-guarantor");

controlSubtitleAnimation(musicPlayerInfo_elmnt, songName_elmnt);
controlSubtitleAnimation(musicPlayerInfo_elmnt, singerName_elmnt);

function controlSubtitleAnimation(parent, child) {
	if (child.classList.contains("animate")) return;

	const element = child.firstChild;

	if (child.clientWidth > parent.clientWidth) {
		child.appendChild(element.cloneNode(true));
		child.classList.add("animate");
	}

}
function handleResize() {
	const vH = window.innerHeight * 0.01;
	setProperty(document.documentElement, "--vH", `${vH}px`);
}
function querySelector(target) {
	return document.querySelector(target);
}
function querySelectorAll(target) {
	return document.querySelectorAll(target);
}
function setProperty(target, prop, value = "") {
	target.style.setProperty(prop, value);
}
function setBodyBg(color) {
	setProperty(document.body, "--body-bg", color);
}
function updateInfo(target, value) {
	while (target.firstChild) {
		target.removeChild(target.firstChild);
	}

	const targetChild_elmnt = document.createElement("span");
	targetChild_elmnt.appendChild(document.createTextNode(value));
	target.appendChild(targetChild_elmnt);
	target.classList.remove("animate");
	controlSubtitleAnimation(musicPlayerInfo_elmnt, target);
}
function handleScrub(e) {
	const progressOffsetLeft = progress_elmnt.getBoundingClientRect().left;
	const progressWidth = progress_elmnt.offsetWidth;
	const duration = selectedSong.duration;
	const currentTime = (e.clientX - progressOffsetLeft) / progressWidth;
	selectedSong.currentTime = currentTime * duration;
}

handleResize();

window.addEventListener("resize", handleResize);
window.addEventListener("orientationchange", handleResize);
window.addEventListener("transitionstart", ({ target }) => {
	if (target === sliderImgs_elmnt) {
		isLocked = true;
		setProperty(sliderImgs_elmnt, "will-change", "transform");
	}
});
window.addEventListener("transitionend", ({ target, propertyName }) => {
	if (target === sliderImgs_elmnt) {
		isLocked = false;
		setProperty(sliderImgs_elmnt, "will-change", "auto");
	}
});
window.addEventListener("pointerup", () => {
	if (progressBarIsUpdating) {
		selectedSong.muted = false;
		progressBarIsUpdating = false;
	}
});
window.addEventListener("pointermove", e => {
	if (progressBarIsUpdating) {
		handleScrub(e, this);
		selectedSong.muted = true;
	}
});

// PAGE SHOW EVENT TO RESTART ANIMATION WHEN BACK TO PAGE (bfcache) - animated hand - shadow - JS
document.addEventListener('pageshow', function (event) {
	if (event.persisted) {
		const hand = document.querySelector('.animated-hand');
		const shadow = document.querySelector('.animated-shadow');

		hand.style.animation = 'none';
		shadow.style.animation = 'none';

		hand.offsetHeight;
		shadow.offsetHeight;

		hand.style.animation = '';
		shadow.style.animation = '';
	}
});