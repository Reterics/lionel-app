'use strict';

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
const mimeTypeList = {
	'image/apng': 'apng',
	'image/bmp': 'bmp',
	'image/gif': 'gif',
	'image/x-icon': ['ico', 'cur'],
	'image/jpeg': ['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp'],
	'image/png': 'png',
	'image/svg+xml': 'svg',
	'image/tiff': ['tif', 'tiff'],
	'image/webp': 'webp',
	'image/aces': 'exr',
	'image/heic': 'heic',
	'image/tiff-fx': 'tfx',
	'image/wmf': 'wmf',

	'audio/aac': 'aac',
	'audio/3gpp': '3gpp',
	'audio/midi': ['mid', 'midi'],
	'audio/mp3': 'mp3',
	'audio/mp4': ['m4a', 'mp4a'],
	'audio/mpeg': ['mp3', 'm3a', 'mpga', 'mp2', 'mp2a', 'm2a' ],
	'audio/ogg': ['oga', 'ogg'],
	'audio/wav': 'wav',
	'audio/wave': 'wav',
	'audio/webm': 'weba',

	'application/x-freearc': 'arc',
	'application/java-archive': ['jar', 'ear'],
	'application/zip': 'zip',
	'application/x-bzip': 'bz',
	'application/x-bzip2': 'bz2',
	'application/x-7z-compressed': '7z',
	'application/x-rar-compressed': 'rar',

	'font/woff': ['woff'],
	'font/woff2': ['woff2'],
	'font/otf': ['otf'],
	'font/ttf': ['ttf'],
	'font/collection': ['ttc'],

	'video/3gpp': ['3gp', '3gpp'],
	'video/3gpp2': ['3g2'],
	'video/mp2t': ['ts'],
	'video/mp4': ['mp4', 'mp4v', 'mpg4'],
	'video/mpeg': ['mpeg', 'mpg'],
	'video/ogg': ['ogv'],
	'video/quicktime': ['qt', 'mov'],
	'video/webm': ['webm'],
	'video/x-msvideo': 'avi',

	'text/html': ['html', 'html', 'xhtml'],
	'text/plain': [ 'txt', 'text', 'conf', 'def', ],
	'text/css': ['css', 'scss'],
	'text/cache-manifest': ['appcache', 'manifest'],

	'text/coffeescript': ['coffee', 'litcoffee'],
	'text/csv': ['csv'],
	'text/javascript': 'js',
	'text/jsx': ['jsx'],
	'text/less': ['less'],
	'text/stylus': ['stylus', 'styl'],
	'text/tab-separated-values': ['tsv'],
	'text/markdown': ['markdown', 'md'],
	'application/pdf': 'pdf',
	'application/epub+zip': ['epub'],
	'application/xml': ['xml', 'xsl', 'xsd', 'rng'],
	'application/xaml+xml': ['xaml'],
	'application/json': ['json', 'map'],
	'application/manifest+json': ['webmanifest'],
	'application/octet-stream': [ 'exe', 'dll', 'bin', 'img', 'dist', 'deb', 'pkg', 'dump', 'dmg', 'msi', 'iso'],
	'application/xhtml+xml': ['xhtml', 'xht'],
};

module.exports = {
	mimes: mimeTypeList,
	/**
	 * Check whether the specific file path contains a valid file what has content-type in our database
	 * @param path
	 * @returns {*}
	 */
	checkFile: function (path) {
		const ext = path.substr(path.lastIndexOf('.') + 1);
		const types = Object.keys(mimeTypeList);

		let contentType = null;
		types.forEach(function (typeName) {
			if (Array.isArray(mimeTypeList[typeName])) {
				mimeTypeList[typeName].forEach(function (extension) {
					if (extension === ext) {
						contentType = typeName;
					}
				});
			} else if (mimeTypeList[typeName] && typeof mimeTypeList[typeName] === 'string') {
				const extension = mimeTypeList[typeName];
				if (extension === ext) {
					contentType = typeName;
				}
			}
		});
		return contentType;
	}
};
