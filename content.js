console.log("content.js loaded");
// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDUb2l9-4Ym4JyinFVj-mudq9svWKQZR0c",
    authDomain: "adloxs-approval-v1.firebaseapp.com",
    databaseURL: "https://adloxs-approval-v1-default-rtdb.firebaseio.com",
    projectId: "adloxs-approval-v1",
    storageBucket: "adloxs-approval-v1.appspot.com",
    messagingSenderId: "133751828740",
    appId: "1:133751828740:web:fc60dfda95c866a6846051"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const databaseRef = firebase.database().ref();

databaseRef.once('value').then(snapshot => {
    const data = snapshot.val();
    console.log(data);  // You can display this data in your popup or use as needed.
}).catch(error => {
    console.error("Error fetching data:", error);
});

const thumbnailsRef = firebase.database().ref('thumbnails');

function fetchThumbnailsForDiscordId(discordId) {
    return new Promise((resolve, reject) => {
        thumbnailsRef.child(discordId).once('value', snapshot => {
            if (snapshot.exists()) {
                const thumbnailsData = snapshot.val();
                const thumbnailUrls = Object.values(thumbnailsData).map(data => data.thumbnail);
                resolve(thumbnailUrls);
            } else {
                resolve([]); // No thumbnails found
            }
        }, error => {
            reject(error);
        });
    });
}

function fetchAssociatedThumbnails(discordIds) {
    Promise.all(discordIds.map(fetchThumbnailsForDiscordId))
        .then(results => {
            const allThumbnails = [].concat(...results);
            console.log("All associated thumbnails:", allThumbnails);
        })
        .catch(error => {
            console.error("Error fetching thumbnails:", error);
        });
}

const url = window.location.href;
const match = url.match(/channel\/(UC[^?\/]+)/);

let channelId;
if (match && match[1]) {
    channelId = match[1];
    console.log("Channel ID:", channelId);

    const dbRef = firebase.database().ref('al_channel_associations');

    if (channelId) {
        dbRef.child(channelId).once('value', snapshot => {
            if (snapshot.exists()) {
                const discordIds = snapshot.val();
                const discordIdsArray = Object.values(discordIds);
                console.log("Associated Discord IDs:", discordIdsArray);
                
                // Fetch thumbnails after fetching Discord IDs
                fetchAssociatedThumbnails(discordIdsArray);
            } else {
                console.log("No Discord IDs found for this YouTube channel.");
            }
        });
    }
} else {
    console.error("Could not extract channel ID from URL");
}


let reviewBoxVisible = false;
let fullscreenClosed = false;  // New flag

function createReviewBox(thumbnails) {  // Added 'thumbnails' as a parameter
    const reviewBox = document.createElement('div');
    reviewBox.className = 'reviewBoxClass';
    reviewBox.id = 'adloxsReviewBox';
    reviewBox.style.width = '400px';
    reviewBox.style.border = '1px solid grey';
    reviewBox.style.padding = '10px';
    reviewBox.style.position = 'fixed';
    reviewBox.style.top = '72px';
    reviewBox.style.left = '20.5%';
    reviewBox.style.backgroundColor = '#fff';
    reviewBox.style.zIndex = '1000';
    reviewBox.style.overflowY = 'auto';

    const baseHeightPerThumbnail = 80;  // Assume each thumbnail container needs about 150px. Adjust as needed.
    const totalHeight = thumbnails.length * baseHeightPerThumbnail;
    const maxHeight = window.innerHeight * 0.8;  // Let's set a max height to 80% of the viewport height

    reviewBox.style.height = Math.min(totalHeight, maxHeight) + 'px';  // Set the height based on thumbnail count but don't exceed maxHeight
    
    if (totalHeight > maxHeight) {
        reviewBox.style.overflowY = 'auto';  // If the content exceeds the max height, make it scrollable
    }

    return reviewBox;
}



function addReviewButton() {
    const existingButton = document.querySelector('ytcp-home-button');
    if (existingButton && !document.querySelector('.reviewButton')) {
        const reviewBtn = document.createElement('button');
        reviewBtn.innerText = 'Review';
        reviewBtn.className = 'reviewButton';
        reviewBtn.style.backgroundColor = 'red';  
        reviewBtn.style.color = 'white'; 

        // Modify the button size, round the edges, move it down, and remove the border
        reviewBtn.style.height = '25px';           // Set the height. Adjust as needed.
        reviewBtn.style.padding = '0 5px';         // Reduce padding to make button smaller overall. Adjust as needed.
        reviewBtn.style.borderRadius = '5px';      // Rounded edges. Adjust for more or less rounding.
        reviewBtn.style.marginTop = '7px';         // Move the button down slightly. Adjust as needed.
        reviewBtn.style.border = 'none';  

        reviewBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (reviewBoxVisible) {
                const existingReviewBox = document.querySelector('.reviewBoxClass');
                if (existingReviewBox) existingReviewBox.remove();
                reviewBoxVisible = false;
            } else {
                const thumbnails = [
                    { src: 'https://i.imgur.com/Wt3lS5f.jpg', description: 'Example video title' },
                    { src: 'https://i.imgur.com/SPeymkF.jpg', description: 'would you wear purple lipstick? testing out a longer title i want to see what it would look like.' },
                    { src: 'https://cdn.discordapp.com/ephemeral-attachments/1157208871148978197/1157329857810813099/Chocolate_Lava_Cake_From_Scratch.jpg?ex=651836ec&is=6516e56c&hm=e2263e963070ba004d408aaa5446cf9ef08382a88a34ff9f30598b3507c05292&', description: 'Example video title' },
                    { src: 'https://cdn.discordapp.com/ephemeral-attachments/1157505145458933951/1157505495490375750/Eating_A_3000_Michelin_Star_Dinner.jpg?ex=6518da7f&is=651788ff&hm=cc5e06f0eaa210fd45ac1eb6e5a01a219277e2a9200511bb72723b3c69568136&', description: 'would you wear purple lipstick? testing out a longer title i want to see what it would look like.' },
                    { src: 'https://cdn.discordapp.com/ephemeral-attachments/1157502732756865155/1157768057150783638/10000_Hyper-Realistic_Cake.jpg?ex=6519cf07&is=65187d87&hm=f966eb71b94a578301e542fc5a991137b3d4d04d928a491ec8838e4f34e9fa09&', description: 'Example video title' },
                    { src: 'https://cdn.discordapp.com/ephemeral-attachments/1157502732756865155/1157775900478275704/Homemade_Churros_with_Nutella.jpg?ex=6519d655&is=651884d5&hm=937a58dd535e3d27fda40109841cec427cd13fba9dea4114b5eb086977054cd7&', description: 'would you wear purple lipstick? testing out a longer title i want to see what it would look like.' },
                    { src: 'https://cdn.discordapp.com/ephemeral-attachments/1157502732756865155/1157776051351592960/Liver-with-Text.jpg?ex=6519d679&is=651884f9&hm=11b9b12492beb9d99725322d5de07b8af0bb1ad9b6783f4fee164f3363c21f54&', description: 'Example video title' },
                    { src: 'https://cdn.discordapp.com/ephemeral-attachments/1157502732756865155/1157776187494518845/thumbnail_38.png?ex=6519d699&is=65188519&hm=7fc0109e7879e243cc6c9979d0561510c215c5b8a228aa410463208c1ae262d7&', description: 'would you wear purple lipstick? testing out a longer title i want to see what it would look like.' },
                    { src: 'https://cdn.discordapp.com/ephemeral-attachments/1157502732756865155/1157777278344892426/b12_2.jpg?ex=6519d79d&is=6518861d&hm=fe8b5348159e240d38f41a8cb3d92becc5aab1f3dfe672a222856c033e197458&', description: 'Example video title' },
                    { src: 'https://cdn.discordapp.com/ephemeral-attachments/1157502732756865155/1157777347181826169/Firefly_20230928174637.png?ex=6519d7ae&is=6518862e&hm=7e0776e9d5f05045879a9b95e497ef3006fb068dd705bfa72dcbca79d76e90f6&', description: 'would you wear purple lipstick? testing out a longer title i want to see what it would look like.' },
                    // ... add more data
                ];

                 const reviewBox = createReviewBox(thumbnails);  // Now the thumbnails variable is correctly passed

                thumbnails.forEach((thumbnail, index) => {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.marginBottom = '10px';
        if (index !== thumbnails.length - 1) { 
            container.style.borderBottom = '1px solid lightgrey';
        }
        container.style.paddingBottom = '10px';

        const img = document.createElement('img');
        img.src = thumbnail.src;
        img.style.display = 'block';
        img.width = 120;
        img.style.marginRight = '15px';
        img.style.borderRadius = '5px';
        img.style.cursor = 'pointer';
        img.className = 'thumbnail-image';  // New: Add a class for the thumbnail
        img.setAttribute('data-src', thumbnail.src);  // New: Set a data attribute for referencing
        img.onclick = function() {
            viewImageFullscreen(thumbnail.src, thumbnail);
        };

        const desc = document.createElement('div');
        desc.innerText = thumbnail.description;
        desc.style.flexGrow = '1';
        desc.style.fontSize = '14px';  // Updated font size
        desc.className = 'description';

        container.appendChild(img);
        container.appendChild(desc);
        reviewBox.appendChild(container);
    });


                document.body.appendChild(reviewBox);
                reviewBoxVisible = true;
            }
        });

        existingButton.insertAdjacentElement('afterend', reviewBtn);
    }
}

// ... The rest of your content.js, no change ...


function viewImageFullscreen(imageUrl, thumbnail) {
    const fullscreenDiv = document.createElement('div');
    fullscreenDiv.style.position = 'fixed';
    fullscreenDiv.style.top = '0';
    fullscreenDiv.style.left = '0';
    fullscreenDiv.style.width = '100vw';
    fullscreenDiv.style.height = '100vh';
    fullscreenDiv.style.backgroundColor = 'rgba(0,0,0,0.9)';
    fullscreenDiv.style.zIndex = '2000';
    fullscreenDiv.style.display = 'flex';
    fullscreenDiv.style.justifyContent = 'center';
    fullscreenDiv.style.alignItems = 'center';
    fullscreenDiv.id = 'fullscreenDiv';

    const largeImage = document.createElement('img');
    largeImage.src = imageUrl;
    largeImage.style.maxWidth = '90%';
    largeImage.style.maxHeight = '90%';
    largeImage.style.borderRadius = '10px';
    largeImage.style.marginRight = '20px';  // Create space between the image and the buttons

    // Create the approve button
    const approveBtn = document.createElement('button');
    approveBtn.innerText = '✔';
    approveBtn.style.backgroundColor = 'green';
    approveBtn.style.color = 'white';
    approveBtn.style.marginBottom = '10px';
    approveBtn.style.border = 'none';
    approveBtn.style.padding = '5px 10px';  // Increase the padding to make the button larger
    approveBtn.style.borderRadius = '4px';  // Round the button corners
    approveBtn.style.fontSize = '20px';  // Increase the font size for visibility
    approveBtn.onclick = function(event) {
    event.stopPropagation();
    console.log(thumbnail.src + ' approved');
    document.body.removeChild(fullscreenDiv);

    // New: Apply approved styles
    const associatedThumbnailContainer = document.querySelector(`[data-src="${thumbnail.src}"]`).parentNode;
    if (associatedThumbnailContainer) {

        associatedThumbnailContainer.classList.add('approved');
        associatedThumbnailContainer.classList.remove('revised');

    }
};
    // Create the revise button
    const reviseBtn = document.createElement('button');
    reviseBtn.innerText = '✖';
    reviseBtn.style.backgroundColor = 'red';
    reviseBtn.style.color = 'white';
    reviseBtn.style.border = 'none';
    reviseBtn.style.padding = '5px 10px';  // Increase the padding to make the button larger
    reviseBtn.style.borderRadius = '4px';  // Round the button corners
    reviseBtn.style.fontSize = '20px';  // Increase the font size for visibility
    reviseBtn.onclick = function(event) {
    event.stopPropagation();
    const comment = prompt('Enter your revision request:', '');
    if (comment) {
        console.log('Revision for ' + thumbnail.src + ':', comment);
    }
    document.body.removeChild(fullscreenDiv);

    // New: Apply revised styles
    const associatedThumbnailContainer = document.querySelector(`[data-src="${thumbnail.src}"]`).parentNode;
    if (associatedThumbnailContainer) {

        associatedThumbnailContainer.classList.add('revised');
        associatedThumbnailContainer.classList.remove('approved');

    }
};


    // Container for the buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.alignItems = 'flex-end';  // Align buttons to the right
    buttonContainer.style.marginRight = '10px';  // Add some space on the right

    buttonContainer.appendChild(approveBtn);
    buttonContainer.appendChild(reviseBtn);

    fullscreenDiv.appendChild(largeImage);
    fullscreenDiv.appendChild(buttonContainer);  // Append the buttons to the fullscreenDiv

    document.body.appendChild(fullscreenDiv);

    fullscreenDiv.onclick = function(event) {
        event.stopPropagation();
        document.body.removeChild(fullscreenDiv);
        fullscreenClosed = true; 

        setTimeout(() => {
            fullscreenClosed = false;
        }, 10);
    };
}

function injectStyles() {
    console.log("Injecting styles...");
    const styles = `
        .approved .description {
            text-decoration: line-through;
            color: green;
        }

        .approved .thumbnail-image {
            filter: brightness(50%) sepia(1) hue-rotate(100deg); /* green filter */
        }

        .revised .description {
            text-decoration: line-through;
            color: red;
        }

        .revised .thumbnail-image {
            filter: brightness(70%) sepia(1) hue-rotate(0deg); /* red filter */
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}


injectStyles(); // manually invoke the function

document.addEventListener('click', function (event) {
    const reviewBox = document.getElementById('adloxsReviewBox');
    const fullscreenDiv = document.getElementById('fullscreenDiv');

    if (reviewBoxVisible && reviewBox && 
        !reviewBox.contains(event.target) && 
        !event.target.matches('.reviewButton') && 
        (!fullscreenDiv || !fullscreenDiv.contains(event.target)) && 
        !fullscreenClosed) {
        reviewBox.remove();
        reviewBoxVisible = false;
    }
});

document.addEventListener('DOMContentLoaded', addReviewButton);

const reviewButtonObserver = new MutationObserver(addReviewButton);
reviewButtonObserver.observe(document.body, { childList: true, subtree: true });

  