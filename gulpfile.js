import gulp from "gulp";
import del from "del";
import babel from "gulp-babel";
import htmlMin from "gulp-htmlmin";
import scss from "gulp-sass";
import postcss from "gulp-postcss";
import csso from "postcss-csso";
import terser from "gulp-terser";
import autoprefixer from "autoprefixer";
import groupMedia from "gulp-group-css-media-queries";
import browserSync from "browser-sync";

// System
const server = browserSync.create();

const paths = {
  layout: {
    src: "src/*.html",
    dest: "docs/",
  },
  styles: {
    src: "src/assets/sass/main.scss",
    dest: "docs/assets/styles/",
    watch: "src/assets/sass/**/*.scss",
  },
  scripts: {
    src: "src/assets/scripts/**/*.js",
    dest: "docs/assets/scripts/",
  },
};

// Service
const clean = () => del(["docs"]);

const reload = (done) => {
  server.reload();
  done();
};

const serve = (done) => {
  server.init({
    server: {
      baseDir: "./docs",
    },
  });
  done();
};

const copy = () =>
  gulp
    .src(["src/assets/fonts/**/*", "src/assets/images/**/*"], { base: "src" })
    .pipe(gulp.dest("docs/"))
    .pipe(server.stream({ once: true }));

// HTML
const html = () => {
  return gulp
    .src(paths.layout.src)
    .pipe(htmlMin({ removeComments: true, collapseWhitespace: true }))
    .pipe(gulp.dest(paths.layout.dest))
    .pipe(server.stream());
};

// Styles
const css = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(groupMedia())
    .pipe(postcss([autoprefixer, csso]))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(server.stream());
};

// Scripts
const js = () => {
  return gulp
    .src(paths.scripts.src)
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(terser())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(server.stream());
};

// Watcher
const watch = () => {
  gulp.watch(paths.layout.src, gulp.series(html));
  gulp.watch(paths.styles.watch, gulp.series(css));
  gulp.watch(paths.scripts.src, gulp.series(js));
  gulp.watch(
    ["src/assets/fonts/**/*", "src/assets/images/**/*"],
    gulp.series(copy)
  );
};

// Default
export default gulp.series(
  clean,
  gulp.parallel(html, css, js, copy),
  gulp.parallel(serve, watch)
);
