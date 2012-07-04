// namespace
var cal = {
  baseUrl: 'http://picasaweb.google.com/data/feed/api',
  userId: '/user/106931600639819087049',
  albumId: '/albumid/',
  kindAlbum: 'kind=album',
  kindPhoto: 'kind=photo',
  version: '&v=2.0',
  alt: '&alt=json',
  fieldsAlbum: '&fields=entry(id,media:group(media:content,media:description,media:keywords,media:title))',
  fieldsImage: '&fields=entry(title,gphoto:numphotos,media:group(media:content,media:thumbnail))',
  callback: '&callback=?', //needed for idiotic IE compat
  //lang: '&hl=en_US',
  //access: '&access=visible',

  init: function() {
    hs.lang.creditsText = '';

    // overload
    hs.updateAnchors = function() {
      var i, el, all = [], images = [], groups = {};
      var g = 'albumCnt';
      var elems = document.getElementById(g).childNodes;
      for (i in elems) {
        el = elems[i];
        if (el.nodeName == 'A') {
          hs.push(all, el);
          hs.push(images, el);
          if (!groups[g]) groups[g] = [];
          hs.push(groups[g], el);
        }
      }
      hs.anchors = { all: all, groups: groups, images: images };
      return hs.anchors;
    };

    // overload
    hs.getAnchors = function() {
      return hs.anchors;
    };

    // overload
    hs.getSrc = function (a) {
      return a.href;
    };

    // Slideshow viewer config
    hs.align = 'center';
    hs.transitions = ['expand', 'crossfade'];
    hs.wrapperClassName = 'dark borderless floating-caption';
    hs.fadeInOut = true;
    hs.dimmingOpacity = .75;

    // Set up slideshow viewer
    hs.addSlideshow({
      slideshowGroup: 'albumCnt',
      interval: 5000,
      repeat: false,
      useControls: true,
      fixedControls: 'fit',
      allowSizeReduction: true,
      overlayOptions: {
        className: 'text-controls',
        position: 'bottom center',
        relativeTo: 'viewport',
        offsetY: -60
      },
      thumbstrip: {
        position: 'bottom center',
        mode: 'horizontal',
        relativeTo: 'viewport'
      }
    });

    // Compile the markup as a named template
    $.template("albumTemplate", this.albumTmpl);
    $.template("imageTemplate", this.imageTmpl);

  },

  getAlbumUrl: function() {
    return this.baseUrl + this.userId + '?' + this.kindAlbum + this.version + this.alt + this.fieldsAlbum + this.callback;
  },

  getImagesUrl: function(albumId) {
    return this.baseUrl + this.userId + this.albumId + albumId + '?' + this.kindPhoto + this.version + this.alt + this.fieldsImage + this.callback;
  },

  createAlbumThumbs: function() {
    var url = this.getAlbumUrl();
    var albums = [];
    $.getJSON(url, function(data) {
      var album = null, i, title, element, entries = data.feed.entry;
      for (i in entries) {
        element = entries[i];
        title = element["media$group"]["media$title"]["$t"];
        title = (title && title!='') ? title.substr(0, 7) : 'Profile';
        if (title != 'Profile') {
          album = {
            id: element.id["$t"].split("?")[0].split("albumid/")[1],
            title: element["media$group"]["media$title"]["$t"],
            description: element["media$group"]["media$description"]["$t"],
            thumb: element["media$group"]["media$content"][0]["url"]
          };
          albums.push(album);
        }
      }
      $.tmpl("albumTemplate", albums).appendTo('#picasaAlbum');
      $('#picasaAlbum').css('display', 'block');

    });
  },

  albumTmpl: '<a href="javascript:void(0)"><div class="image">' +
      '<img alt="" src="${thumb}?imgmax=160&amp;crop=1" onclick="return cal.loadSlideShow(\'${id}\');"/>' +
      '<div class="text" onclick="return cal.loadSlideShow(\'${id}\');"><span>${title}</span></div>' +
    '</div></a>',

  // executed by album thumbnail
  loadSlideShow: function(albumId) {
    cal.getImageList(albumId, function() {
      hs.updateAnchors();
      var elem = hs.anchors.all[0];
      hs.expand(elem, {slideshowGroup:'albumCnt'});
    });
    return false;
  },

  imageTmpl: '<a class="highslide" onclick="return hs.expand(this, {slideshowGroup:\'albumCnt\'})" href="${url}"><img src="${thumb}" alt=""></a>',

  getImageList: function(albumId, callback) {
    var url = cal.getImagesUrl(albumId);
    $.getJSON(url, function(data) {
    	cal.ajaxSuccess(data);
      callback();
    });
  },

  ajaxSuccess: function(data) {
    var images = [], image, i, element, entries = data.feed.entry;
    for (i in entries) {
      element = entries[i];
      image = {
        url: element["media$group"]["media$content"][0].url,
        title: element.title["$t"],
        thumb: element["media$group"]["media$thumbnail"][0].url
      };

      images.push(image);
    }

    $('#albumCnt').empty();
    $.tmpl("imageTemplate", images).appendTo('#albumCnt');
  }

};

