if (!FileReader || !URL.createObjectURL) {
    alert('Your browser cannot work with Amazing64');
    throw new Error;
}
Object.prototype.extend = function (obj) {
    for (var key in obj) if (obj.hasOwnProperty(key)) this[key] = this[key] || obj[key];
    return this;
};

Array.prototype.unique = [].unique || function () {
    var filter_function = function (element, index, array) {
        return array.indexOf(element, index + 1) < 0
    };
    return this.filter(filter_function)
};
Array.prototype.uniqueBy = [].uniqueBy || function (comparerFunction) {
    var mappedArray = this.map(comparerFunction);
    var filter_function = function (element, index, array) {
        return mappedArray.indexOf(comparerFunction(element), index + 1) < 0
    };
    return this.filter(filter_function)
};
//preview generator
var base64Fabric = (function () {

    function generateImageLoadPromise(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () {
                resolve(img)
            };
            img.src = url;
        })
    }

    function createImageWithDominantsPromise(url) {
        return new Promise(function (resolve) {
            generateImageLoadPromise(url).then(function (img) {
                RGBaster.colors(img, function (payload) {
                    resolve({
                        image: img,
                        color: payload.dominantUnwrapped
                    })
                })
            })
        })
    }

    function generateImagePreview(file) {
        return new Promise(function (resolve) {
            Promise.all([
                    generateCommonPreview(file),
                    createImageWithDominantsPromise(URL.createObjectURL(file))
                ]).then(function (data) {
                    resolve(data[0].extend({
                        width: data[1].image.width,
                        height: data[1].image.height,
                        color: data[1].color,
                        type: 'image'
                    }));
                })
        });
    }

    function generateCommonPreview(file) {
        return new Promise(function (resolve) {
            var reader = new FileReader;
            reader.onload = function () {
                resolve({
                    string: reader.result,
                    fileName: file.name,
                    fileSize: file.size
                })
            };
            reader.readAsDataURL(file);
        });
    }

    return function base64Fabric(file) {
        switch (true) {
            case (Boolean(file.type.match(/^image\//))):

                return generateImagePreview(file);
                break;
            default:
                return generateCommonPreview(file);
        }
    }
}).call(this);

//view manager
var viewManager = (function () {
    var VIEW_ZONE = document.querySelector('.body');
    var template = {
        body: function (dataSet) {
            return '<textarea class="preview">' + dataSet.string + '</textarea>'
        },
        title: function (dataSet) {
            var dangerSize = dataSet.fileSize > 32 * 1024;
            return '<span class="fileName">' + dataSet.fileName + '</span>' +
                '<span class="fileSize ' + (dangerSize ? 'danger' : '') + '">' + Math.ceil(dataSet.fileSize / 1024) + ' kB</span>'
        },
        imageDesc: function (dataSet) {
            return '<span class="imageSize">' + dataSet.width + 'px X ' + dataSet.height + 'px</span>'
        },
        colorDesc: function (dataSet) {
            console.log(((dataSet.color.reduce(function(a,b){return a+b}) < 512) ? 'color: white' : ''));
            return '<span class="mainColor" style="' +
                '/*noinspection CssRgbFunction*/ background: rgb(' + dataSet.color.join(',') + ');' +
                ((dataSet.color.reduce(function(a,b){return a+b}) < 256 * 1.5) ? 'color: white' : '') +
                '">' +
                'rgb(' + dataSet.color.join(',') + ') #' + dataSet.color.map(function (n) {
                var string = n.toString(16);
                if (string.length === 1) {
                    return '0' + string;
                } else {
                    return string;
                }
            }).join('') +
                '</span>'
        },
        imagePreview: function (dataSet) {
            return '<div class="imageContainer">' +
                '<div class="image" style="' +
                'width: ' + dataSet.width + 'px; ' +
                'height: ' + dataSet.height + 'px; ' +
                'background-image: url(' + dataSet.string + ')"></div>' +
                '</div>'
        }
    };

    function createPreviewObject(dataSet) {
        switch (dataSet.type) {
            case 'image':
                return {
                    title: template.title(dataSet) + template.imageDesc(dataSet) + template.colorDesc(dataSet),
                    body: template.imagePreview(dataSet) + template.body(dataSet)
                };
                break;
            default:
                return {
                    title: template.title(dataSet),
                    body: template.body(dataSet)
                }
        }
    }

    function createPreview(dataSet, index) {
        var preview = createPreviewObject(dataSet);
        return '<section data-id="' + index + '">' +
            '<div class="previewTitle">' + preview.title + '</div>' +
            '<div class="previewBody">' + preview.body + '</div>' +
            '<div class="remove cross"></div>' +
            '</section>'
    }


    var dataSetList = [];
    if (localStorage.dataSetList) {
        try {
            dataSetList = JSON.parse(localStorage.dataSetList);
            if (!Array.isArray(dataSetList)) {
                dataSetList = [];
            }
            render(dataSetList);
        } catch (e) {
        }
    }

    function render(newDataSetList) {
        newDataSetList = newDataSetList.uniqueBy(function (e) {
            return e.string
        });
        var dataSetListJSON = JSON.stringify(newDataSetList);
        if (dataSetListJSON > 2 * 1024 * 1024) {
            var storedDataSetList = dataSetList.slice();
            while (dataSetListJSON > 2 * 1024 * 1024) {
                storedDataSetList.shift();
                dataSetListJSON = JSON.stringify(storedDataSetList);
            }
        }
        localStorage.dataSetList = dataSetListJSON;
        dataSetList = newDataSetList;
        VIEW_ZONE.innerHTML = dataSetList.map(createPreview).reverse().join('')
    }

    function addPreview(preview) {
        dataSetList.push(preview);
        render(dataSetList);
    }

    VIEW_ZONE.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove')) {
            var index = Number(e.target.parentElement.dataset.id);
            render(dataSetList.slice(0, index).concat(dataSetList.slice(index + 1)))
        }
    });

    return {
        addFile: function (file) {
            base64Fabric(file).then(function (dataSet) {
                addPreview(dataSet);
            })
        }
    }
}).call(this);

//dropper
(function () {
    var MAX_FILE_SIZE = 1024 * 1024,
        DROP_CONTAINER = document.body,
        DROP_ZONE = document.querySelector('.dragdropzone');

    function wrap(callback) {
        return function (e) {
            e.preventDefault();
            callback(e);
            return false;
        }
    }

    DROP_CONTAINER.addEventListener('dragover', wrap(function (e) {
        DROP_CONTAINER.classList.add('dragover');
    }));
    DROP_ZONE.addEventListener('dragleave', wrap(function (e) {
        DROP_CONTAINER.classList.remove('dragover');
    }));
    window.addEventListener('dragleave', wrap(function (e) {
        if (e.target == DROP_CONTAINER) {
            DROP_CONTAINER.classList.remove('dragover');
        }
    }));
    DROP_CONTAINER.addEventListener('drop', wrap(function (e) {
        DROP_CONTAINER.classList.remove('dragover');
        [].forEach.call(e.dataTransfer.files, fileDropped);
    }));

    function fileDropped(file) {
        if (file.size <= MAX_FILE_SIZE) viewManager.addFile(file)
    }
}).call(this);


//todo dragndrop элементов
//todo кнопка сброса