from pathlib import Path

bad_open = "<" + "motion" + ">"
bad_close = "</" + "motion" + ">"
good_open = "<" + "div" + ">"
good_close = "</" + "motion" + ">"
good_close = "</" + "div" + ">"

path = Path(__file__).parent / "index.html"
text = path.read_text(encoding="utf-8")

text = text.replace(bad_close, good_close)
text = text.replace(bad_open, good_open)

preloader = "<" + "div" + ' class="preloader" aria-hidden="true">'
text = text.replace(
    '<body class="page-home">\n    ' + good_open,
    '<body class="page-home">\n    ' + preloader,
    1,
)

identity = "<" + "div" + ' class="identity-grid">'
text = text.replace(
    '<' + "div" + ' class="preloader-fill"></' + "motion" + ">",
    identity,
)
text = text.replace(
    '<' + "div" + ' class="preloader-fill"></' + "div" + ">",
    identity,
    1,
)

path.write_text(text, encoding="utf-8")
print("done")
