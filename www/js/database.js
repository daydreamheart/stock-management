/* - - - - - - - - - - - - - - - - -
   Methods for the Firebase Database 
- - - - - - - - - - - - - - - - - - */

try {
  if (initFirebase) {
    useDatabaseApi = true;
    initFirebase(); // initialize Firebase    
  }
} catch {
  console.log('Firebase is not initialized.');
  console.log('Data is saved to the localStorage.');
}

// Add new items to the Shop List
function addNewShopToFirebase(jsonObject) {
  db.collection('shops').add({
    'name': jsonObject.name,
    'telephone': jsonObject.telephone,
    'address': jsonObject.address,
    'location': jsonObject.location
  });
}

// Add new items to the Product List
function addNewProductToFirebase(jsonObject, imgSrc) {
  db.collection('products').add({
    'code': jsonObject.code,
    'name': jsonObject.name,
    'price': jsonObject.price,
    'quantity': jsonObject.quantity,
    'shop': jsonObject.shop,
    'image': imgSrc
  });
}

// Uploading picture
function uploadImageToFirebaseStorage(elementName, fileName, img, edit) {
  const storageRef = firebase.storage().ref('products/' + fileName);
  const uploadTask = storageRef.putString(img, 'base64');

  uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
    function (snapshot) {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      elementName.innerHTML = 'Upload is ' + Math.trunc(progress) + '% done';

      if (progress == 100) {
        if (edit)
          app.dialog.alert('Saved product details.', '');
        else {
          app.dialog.alert("Product added to the products list.", "");
          app.methods.emptyNewProductForm();
          document.getElementById("imageFile").src = "assets/pictures/camera.png";
          elementName.innerHTML = "";
        }
      }

      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED:
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING:
          console.log('Upload is running');
          break;
      }
    },
    function (error) {
      console.log(error.code);
      switch (error.code) {
        case 'storage/unauthorized':
          break;
        case 'storage/canceled':
          break;
        case 'storage/unknown':
          break;
        case 'storage/invalid-format':
          break;
      }
    });
}

// To get the picture from the database 
function getImage(data, pageName) {
  const storageRef = firebase.storage().ref();
  const filename = 'products/' + data.code + data.shop + '.jpg';
  const ref = storageRef.child(filename);

  // Get the download URL
  ref.getDownloadURL().then(function (url) {
    if (pageName == "HOME")
      document.getElementById(`${data.code}${data.shop}`).src = url;
    else if (pageName == "EDIT")
      document.getElementById('imageFile').src = url;
    else if (pageName == "PRODUCT")
      document.getElementById(`${data.code}${data.shop}_img`).src = url;
  }).catch(function (error) {
    switch (error.code) {
      case 'storage/object-not-found':
        break;
      case 'storage/unauthorized':
        break;
      case 'storage/canceled':
        break;
      case 'storage/unknown':
        break;
    }
  });
};

// Search by one filled field
const oneFieldSearch = (elementName, stringName, fieldName) => {
  db.collection('products').where(stringName, '>=', fieldName).where(stringName, '<=', fieldName + '\uf8ff')
    .get()
    .then((snapshot) => {
      let count = 0;
      let result = '';
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        count++;
        result += `
        <div class="card-bg block block-strong inset">
          <p>Product Code: <span>${data.code}</span></p>
          <p>Name: <span>${data.name}</span></p>
          <p>Shop: <span>${data.shop}</span></p>
          <p>Price: <span>${data.price}</span></p>
          <p>Quantity: <span id="search-quantity">${data.quantity}</span></p>
          <div class="block display-flex justify-content-center">`
        result += `<img style="width:146px;height:146px" id="${data.code}${data.shop}_img" src="${data.image}"/>`
        result += `
          </div>
          <div class="display-flex justify-content-center">
            <div class="stepper stepper-init stepper-small stepper-raised" data-value-el="#">
              <div id="minus" class="stepper-button-minus update-quantity-minus" data-quantity="${data.quantity}" data-product-id="${doc.id}"></div>
              <div id="plus" class="stepper-button-plus update-quantity-plus" data-quantity="${data.quantity}" data-product-id="${doc.id}"></div>
            </div>
          </div>   
        </div>`;

        if (data.image == "") getImage(data, "PRODUCT");
      });

      if (count == 0) {
        result += `
        <div class="card-bg block block-strong inset">
            <div class="display-flex justify-content-center">Product Not Found</div>
        </div>`;
      }

      elementName.innerHTML = result;
    }).catch((error) => {
      console.log("Error getting documents: ", error);
    });
}

// Search by two filled field
const twoFieldSearch = (elementName, stringName, fieldName, stringName2, fieldName2) => {
  db.collection('products').where(stringName, '==', fieldName).where(stringName2, '==', fieldName2).get().then((snapshot) => {
    let count = 0;
    let result = '';
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      count++;
      result += `
        <div class="card-bg block block-strong inset">
          <p>Product Code: <span>${data.code}</span></p>
          <p>Name: <span>${data.name}</span></p>
          <p>Shop: <span>${data.shop}</span></p>
          <p>Price: <span>${data.price}</span></p>
          <p>Quantity: <span id="search-quantity">${data.quantity}</span></p>
          <div class="block display-flex justify-content-center">`
      result += `<img style="width:146px;height:146px" id="${data.code}${data.shop}_img" src="${data.image}"/>`
      result += `
        </div>
         <div class="display-flex justify-content-center">
            <div class="stepper stepper-init stepper-small stepper-raised" data-value-el="#">
              <div id="minus" class="stepper-button-minus update-quantity-minus" data-quantity="${data.quantity}" data-product-id="${doc.id}"></div>
              <div id="plus" class="stepper-button-plus update-quantity-plus" data-quantity="${data.quantity}" data-product-id="${doc.id}"></div>
            </div>
          </div>   
        </div>`;

      if (data.image == "") getImage(data, "PRODUCT");
    });

    if (count == 0) {
      result += `
        <div class="card-bg block block-strong inset">
            <div class="display-flex justify-content-center">Product Not Found</div>
        </div>`;
    }

    elementName.innerHTML = result;
  });
}

// Search by three filled field
const threeFieldSearch = (elementName, stringName, fieldName, stringName2, fieldName2, stringName3, fieldName3) => {
  db.collection('products').where(stringName, '==', fieldName).where(stringName2, '==', fieldName2).where(stringName3, '==', fieldName3)
    .get().then((snapshot) => {
      let count = 0;
      let result = '';
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        count++;
        result += `
        <div class="card-bg block block-strong inset">
          <p>Product Code: <span>${data.code}</span></p>
          <p>Name: <span>${data.name}</span></p>
          <p>Shop: <span>${data.shop}</span></p>
          <p>Price: <span>${data.price}</span></p>
          <p>Quantity: <span id="search-quantity">${data.quantity}</span></p>
          <div class="block display-flex justify-content-center">`
        result += `<img style="width:146px;height:146px" id="${data.code}${data.shop}_img" src="${data.image}"/>`
        result += `
        </div>
         <div class="display-flex justify-content-center">
            <div class="stepper stepper-init stepper-small stepper-raised" data-value-el="#">
              <div id="minus" class="stepper-button-minus update-quantity-minus" data-quantity="${data.quantity}" data-product-id="${doc.id}"></div>
              <div id="plus" class="stepper-button-plus update-quantity-plus" data-quantity="${data.quantity}" data-product-id="${doc.id}"></div>
            </div>
          </div>   
        </div>`;

        if (data.image == "") getImage(data, "PRODUCT");
      });

      if (count == 0) {
        result += `
        <div class="card-bg block block-strong inset">
            <div class="display-flex justify-content-center">Product Not Found</div>
        </div>`;
      }

      elementName.innerHTML = result;
    });
}

// Real time update with Firebase for the Search
const getRealTimeUpdatesForSearch = (elementName) => {
  let count = 0;
  let result = "";
  const jsonObject = app.methods.dataToJson('#search-product-form');

  if (jsonObject.code == "" && jsonObject.name == "" && jsonObject.shop == "")
    countProductsInFirebase(elementName, count, result);
  else if (jsonObject.code != "" && jsonObject.name == "" && jsonObject.shop == "")
    oneFieldSearch(elementName, 'code', jsonObject.code);
  else if (jsonObject.code == "" && jsonObject.name != "" && jsonObject.shop == "")
    oneFieldSearch(elementName, 'name', jsonObject.name);
  else if (jsonObject.code == "" && jsonObject.name == "" && jsonObject.shop != "")
    oneFieldSearch(elementName, 'shop', jsonObject.shop);
  else if (jsonObject.code != "" && jsonObject.name != "" && jsonObject.shop == "")
    twoFieldSearch(elementName, 'name', jsonObject.name, 'code', jsonObject.code);
  else if (jsonObject.code == "" && jsonObject.name != "" && jsonObject.shop != "")
    twoFieldSearch(elementName, 'name', jsonObject.name, 'shop', jsonObject.shop);
  else if (jsonObject.code != "" && jsonObject.name == "" && jsonObject.shop != "")
    twoFieldSearch(elementName, 'code', jsonObject.code, 'shop', jsonObject.shop);
  else if (jsonObject.code != "" && jsonObject.name != "" && jsonObject.shop != "")
    threeFieldSearch(elementName, 'name', jsonObject.name, 'code', jsonObject.code, 'shop', jsonObject.shop);
}

function countProductsInFirebase(elementName, count, result) {
  db.collection('products').onSnapshot((doc) => {
    doc.docs.forEach((doc) => {
      count++;
    });

    if (count == 0) {
      result += `
      <div class="card-bg block block-strong inset">
        <div class="display-flex justify-content-center">There are no products added to the database.</div>
      </div>`
    }

    elementName.innerHTML = result;
  });
}

// Real time update with Firebase for the Shops
const getRealTimeUpdatesForShops = (elementName) => {
  let count = 0;
  db.collection('shops').onSnapshot((doc) => {
    let result = '';
    doc.docs.forEach((doc) => {
      count++;
      const data = doc.data();
      result += `
        <div class="card-bg block block-strong inset display-flex flex-direction-row">
          <div>
            <p>Name: <span>${data.name}</span></p>
          	<p>Tel: <span>${data.telephone}</span></p>
            <p>Address: <span>${data.address}</span></p>
          </div>
          <div class="topright align-self-flex-start">
					  <i class="icon f7-icons">
              <a href="/edit-shop/${doc.id}/" data-shop-id="${doc.id}" class="get-shop-details-data">pencil</a>
            </i>
				  </div>
        </div>`;
    });

    if (count == 0) {
      result += `
        <div class="card-bg block block-strong inset">
          <div class="item-inner display-flex justify-content-center">There are no shops added to the database.</div>
        </div>`;
    }

    elementName.innerHTML = result;
  });
}

// Real time update with Firebase for the Products
const getRealTimeUpdatesForProducts = (elementName, pageName) => {
  let count = 0;
  db.collection('products').onSnapshot((doc) => {
    let result = '';
    doc.docs.forEach((doc) => {
      count++;
      const data = doc.data();
      result += `
        <div class="card-bg block block-strong inset">
          <div class="display-flex justify-content-space-between">
            <div>
              <p>Product Code: <span>${data.code}</span></p>
              <p>Name: <span>${data.name}</span></p>
              <p>Shop: <span>${data.shop}</span></p>
              <p>Price: <span>${data.price}</span></p>
              <p>Quantity: <span>${data.quantity}</span></p>
            </div>
            <div class="topright align-self-flex-start">
              <i class="icon f7-icons">
                <a href="/edit-product/${doc.id}/" data-product-id="${doc.id}" class="get-product-details-data">pencil</a>
              </i>
            </div>
          </div>
          <div class="block display-flex justify-content-center">
        <div>`;
      if (yahooApiKey) {
        if (pageName == "HOME")
          result += `<img style="width:146px;height:146px" id="${data.code}${data.shop}" src="${data.image}"/>`
        else if (pageName == "PRODUCT")
          result += `<img style="width:146px;height:146px" id="${data.code}${data.shop}_img" src="${data.image}"/>`
      } else {
        if (pageName == "HOME")
          result += `<img style="width:146px;height:146px" id="${data.code}${data.shop}" src="assets/pictures/camera.png">`
        else if (pageName == "PRODUCT")
          result += `<img style="width:146px;height:146px" id="${data.code}${data.shop}_img" src="assets/pictures/camera.png">`
      }
      result += `
        </div>
          </div>
          <div class="display-flex justify-content-center">
            <div class="stepper stepper-init stepper-small stepper-raised" data-value-el="#">
              <div id="minus" class="stepper-button-minus update-quantity-minus" data-quantity="${data.quantity}" data-product-id="${doc.id}"></div>
              <div id="plus" class="stepper-button-plus update-quantity-plus" data-quantity="${data.quantity}" data-product-id="${doc.id}"></div>
            </div>
          </div>   
        </div>`;

      if (data.image == "") getImage(data, pageName);
    });

    if (count == 0) {
      result += `
        <div class="card-bg block block-strong inset">
          <div class="item-inner display-flex justify-content-center">There are no products added to the database.</div>
        </div>`;
    }

    elementName.innerHTML = result;
  });
}