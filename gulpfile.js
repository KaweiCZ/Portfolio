const { watch, series, src, dest, parallel } = require('gulp');
const babel = require("gulp-babel");
const autoprefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass")(require("node-sass"));
const cleanCSS = require("gulp-clean-css");
const browserSync = require("browser-sync").create();
const postCSS = require("gulp-postcss");
const cssNano = require("cssnano");
const fileExists = require("file-exists");
const gulpif = require("gulp-if");
const minifyImages = require("gulp-imagemin");

const webFontsPath= './node_modules/@fortawesome/fontawesome-free/webfonts/*';
const distWebfonts= 'dist/webfonts';

// use a file of webfonts to check it's existing then make a copy in dist
const fontawesomeWebfont =
  './node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.eot';

// to check if file exists or not for testing purposes
console.log(fileExists.sync(fontawesomeWebfont)); // OUTPUTS: true or false

// copy webfonts folder if it exists
// because our task contains asynchronous code
// use async before our task
// to avoid getting this error `Did you forget to signal async completion`
async function copyfontawesomeWebfontsTask() {
  return gulpif(
    fileExists.sync(fontawesomeWebfont),
    src([webFontsPath]).pipe(dest(distWebfonts))
  );
}

function clean(cb) {
  // body omitted
  cb();
}

function images() {
  return src("src/assets/**/*.*")
    .pipe(minifyImages())
    .pipe(dest("dist/static/assets"));
}

function javascript() {
  return src([
      "node_modules/@splidejs/splide/dist/js/splide.min.js",
      "node_modules/modal-vanilla/dist/modal.min.js",
      // "node_modules/aos/dist/aos.js",
      "src/scripts/*.js",
    ])
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(concat("script.js"))
    .pipe(uglify())
    .pipe(dest("dist/static"));
}

function styles() {
  return src("src/scss/*.scss")
    .pipe(concat("styles.scss"))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(src([
      "node_modules/@splidejs/splide/dist/css/splide.min.css",
      "node_modules/aos/dist/aos.css",
      "src/vendors.css"
    ]))
    .pipe(concat("styles.css"))
    .pipe(postCSS([cssNano()]))
    .pipe(cleanCSS())
    .pipe(dest("dist/static"));
}

function browsersyncServe(cb){
  browserSync.init({
    server: {
      baseDir: "."
    }    
  });
  cb();
}

function browsersyncReload(cb){
  browserSync.reload();
  cb();
}

exports.default = function() {
  // You can use a single task
  watch('src/*.scss', styles);
  // Or a composed task
  watch('src/*.js', series(clean, javascript));
};

function watchTask(){
  watch('*.html', browsersyncReload);
  watch('src/**/*.js', series(javascript, browsersyncReload));
  watch(['src/**/*.scss', 'src/*.css'], series(styles, browsersyncReload));
  watch("src/assets/**/*.*", series(images, browsersyncReload));
}

exports.js = javascript;
exports.styles = styles;
exports.watch = series(styles, javascript, copyfontawesomeWebfontsTask, images, browsersyncServe, watchTask);
exports.fontAwesome = copyfontawesomeWebfontsTask;
exports.minifyImages = images;
exports.build = parallel(styles, javascript, copyfontawesomeWebfontsTask, images);
