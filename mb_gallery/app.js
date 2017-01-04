window.addEventListener("load", function() {
  console.log("Hello World!");
  var application_key = "bfc74f633d923cc8cf6bed53acb9ef5f5ed5c948d86e2086ae54992ed5c39e35"; // アプリケーションキー
  var client_key = "3ae0ad481b748c17277d4e4ca121ab7d9a9190f18facbe1fbb23873600486cf9"; // クライアントキー
  NCMB.initialize(application_key, client_key);  // 初期化の実行  
  
  var GalleryController = {
    init : function() {
      console.log(GalleryController);
      GalleryController.refresh();
      $('#image-file').change(function() {
        GalleryController.upload();
      });
    },
    
    // 画像をアップロードする
    upload : function() {
      console.log("アップロード処理開始");
      var fileInput = $("#image-file")[0];
      if (fileInput.files.length > 0) {
        var file = fileInput.files[0];            
        if (!(/\.(png|jpg|jpeg|gif)$/i).test(file.name)) {
          return true;
        }
        
        // ファイルリーダーオブジェクト
        var reader = new FileReader();
        // 縮小画像を当てはめる画像オブジェクト
        var image = new Image();
        
        // ファイルリーダーで読み込んだら以下の処理を実行
        reader.onloadend = function() {
          
          // 画像オブジェクトに読み込んだら以下の処理を実行
          image.onload = function() {
            // 画像を加工するためのCanvasオブジェクト生成
            var canvas = $("<canvas />")[0];
            var max  = 200; // 加工する画像の幅
            ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, 0, 0);
            if (image.width < image.height) {
              // 縦長の場合
              canvas.height = max; // 高さ固定
              canvas.width  = max * image.width / image.height; // 加工後の画像の高さ
            }else{
              canvas.width  = max; // 幅固定
              canvas.height = max * image.height / image.width; // 加工後の画像の高さ
            }
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // 縮小処理
            
            // toDataURLで取り出せるデータはBase64なのでBlobに変換します。
            var data = toBlob(canvas.toDataURL());
            
            // NCMB ファイルストレージの生成
            var ncmbFile = new NCMB.File(Date.now() + file.name, data, "image/png");
            
            // 保存処理
            ncmbFile.save().then(function() {
              // アップロード成功
              console.log("アップロードしました！");
              GalleryController.refresh();
            }, function(error) {
              // アップロード失敗
              console.log("アップロード失敗しました", error);
            });
          };
          
          // ファイルリーダーの結果を画像オブジェクトに適用
          image.src = reader.result;
        };
        
        // ファイルリーダーの読み込み処理開始
        reader.readAsDataURL(file);        
      }
    },

    refresh : function() {
      var query = new NCMB.Query("file");
      query.find().then(function (files) {
          console.log(files);
          GalleryController.render(files);          
        },
        function () {
          console.log(err);
        }
      );
    },
    
    render : function(files) {
      var cellTemplate = $('#grid-table-cell-template')[0];
      var fragment = document.createDocumentFragment();

      files.forEach(function(file) {
        console.log("file", file);
        var cell = cellTemplate.cloneNode(true);
        var objFile = new NCMB.File(file.get('fileName'), null, null, null);
        objFile.fetchImgSource($('img', cell).get(0));
        fragment.appendChild(cell);
      });
      console.log(fragment);
      $('.grid-table-body').empty().append(fragment); 
    }

  };
  GalleryController.init();
});

function toBlob(base64) {
  var bin = atob(base64.replace(/^.*,/, ''));
  var buffer = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i);
  }
  // Blobを作成
  try{
    var blob = new Blob([buffer.buffer], {
      type: 'image/png'
    });
  }catch (e){
    return false;
  }
  return blob;
}
