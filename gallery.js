const galleryContainer = document.getElementById("galleryContainer");
const imageInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const closeLightbox = document.getElementById("closeLightbox");

let images = JSON.parse(localStorage.getItem("familyGallery")) || [];

function renderGallery() {
  galleryContainer.innerHTML = "";
  images.forEach((imgSrc, idx) => {
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("img-wrapper");

    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = `תמונה ${idx+1}`;
    img.classList.add("gallery-img");
    img.onclick = () => openLightbox(imgSrc);

    // כפתור מחיקה
    const delBtn = document.createElement("button");
    delBtn.classList.add("delete-btn");
    delBtn.innerText = "🗑";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm("למחוק את התמונה?")) {
        images.splice(idx, 1);
        localStorage.setItem("familyGallery", JSON.stringify(images));
        renderGallery();
      }
    };

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(delBtn);
    galleryContainer.appendChild(imgWrapper);
  });
}

uploadBtn.onclick = () => {
  const file = imageInput.files[0];
  if (!file) return alert("בחר תמונה להעלאה");
  
  const reader = new FileReader();
  reader.onload = () => {
    images.push(reader.result);
    localStorage.setItem("familyGallery", JSON.stringify(images));
    renderGallery();
    imageInput.value = "";
  };
  reader.readAsDataURL(file);
};

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.style.display = "flex";
}

closeLightbox.onclick = () => {
  lightbox.style.display = "none";
};

renderGallery();
