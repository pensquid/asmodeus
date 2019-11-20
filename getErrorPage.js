const getGif = (code) => code === 404 ? '/missing.gif' : '/help.gif'

module.exports = (code, url) => {
  const gif = getGif(code)
  return `
<!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <link rel='shortcut icon' href='/favicon.png'>
    <link rel='shortcut icon' href='/favicon.png'>
    <title>Error ${code}</title>
    <meta name='description' content='A huge collection of technology-related files containing whatever knowledge you need, whenever you need it.'>
    <meta name='image' content='https://store.pwnsquad.net/favicon.png'>

    <meta itemprop='name' content='PwnStore - Error ${code}'>
    <meta itemprop='description' content='A huge collection of technology-related files containing whatever knowledge you need, whenever you need it.'>
    <meta itemprop='image' content='https://store.pwnsquad.net/favicon.png'>

    <meta name='twitter:card' content='summary'>
    <meta name='twitter:title' content='Error ${code}'>
    <meta name='twitter:description' content='A huge collection of technology-related files containing whatever knowledge you need, whenever you need it.'>
    <meta name='twitter:image:src' content='https://store.pwnsquad.net/favicon.png'>

    <meta name='og:title' content='Error ${code}'>
    <meta name='og:description' content='A huge collection of technology-related files containing whatever knowledge you need, whenever you need it.'>
    <meta name='og:image' content='https://store.pwnsquad.net/favicon.png'>
    <meta name='og:url' content='https://store.pwnsquad.net${url}'>
    <meta name='og:site_name' content='PwnStore'>
    <meta name='og:locale' content='en_US'>
    <meta name='og:type' content='website'>
    
    <style>
      @import url('https://fonts.googleapis.com/css?family=Overpass+Mono:700&display=swap');

      body {
        margin: 0;
        font-family: 'Overpass Mono', monospace;
        background: #000000;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
      }

      h1 {
        font-size: 3rem;
      }

      img {
        width: 100%;
        max-width: 800px;
      }
    </style>
  </head>
  <body>
    <h1>${code}</h1>
    <img src='${gif}' alt='Error ${code}'>
  </body>
</html>
  `
}