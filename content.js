console.log("content.js loaded");

let fullscreenClosed = false;
let reviewBoxVisible = false;
let fullscreenClicked = false;
let currentThumbnailIndex = 0;

const url = window.location.href;
const match = url.match(/channel\/(UC[^?\/]+)/);

let channelId;
if (match && match[1]) {
    channelId = match[1];
    console.log("Channel ID:", channelId);
}

function fetchDiscordChannelsByYouTubeID(youtubeChannelID) {
    return fetch(`https://adloxs.marvelcrm.com/wp-content/plugins/adloxs/files/test.php?action=fetchDiscordChannels&youtube_channel_id=${youtubeChannelID}`)
        .then(response => response.json())
        .then(discordChannelIDs => {
           
        })
        .catch(error => {
            console.error("Error fetching Discord channels by YouTube ID:", error);
        });
}

function fetchThumbnailsByYouTubeID(youtubeChannelID) {
    return fetch(`https://adloxs.marvelcrm.com/wp-content/plugins/adloxs/files/test.php?action=fetchThumbnailsByYouTubeID&youtube_channel_id=${youtubeChannelID}`)
        .then(response => response.json())
        .then(thumbnails => {
            console.log(thumbnails);
            // Handle the thumbnails here
            return thumbnails;
        })
        .catch(error => {
            console.error("Error fetching thumbnails by YouTube ID:", error);
        });
}

function addReviewButton() {
    const existingButton = document.querySelector('ytcp-home-button');
    if (existingButton && !document.querySelector('.reviewButton')) {
        const reviewBtn = document.createElement('button');
        reviewBtn.innerText = 'Review';
        reviewBtn.className = 'reviewButton';
        reviewBtn.style.backgroundColor = 'red';
        reviewBtn.style.color = 'white';        // Modify the button size, round the edges, move it down, and remove the border
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
                // Fetch thumbnails from the PHP endpoint
                fetchThumbnailsByYouTubeID(channelId).then(thumbnails => {
                    const reviewBox = createReviewBox(thumbnails);
                    document.body.appendChild(reviewBox);
                    reviewBoxVisible = true;
                }).catch(error => {
                    console.error("Error fetching thumbnails:", error);
                });
            }
        });

        existingButton.insertAdjacentElement('afterend', reviewBtn);
    }
}

function createReviewBox(thumbnails) {
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
    const totalHeight = thumbnails.length * baseHeightPerThumbnail; // Use thumbnailInfo.length
    const maxHeight = window.innerHeight * 0.8;  // Let's set a max height to 80% of the viewport height

    reviewBox.style.height = Math.min(totalHeight, maxHeight) + 'px';  // Set the height based on thumbnail count but don't exceed maxHeight

    if (totalHeight > maxHeight) {
        reviewBox.style.overflowY = 'auto';  // If the content exceeds the max height, make it scrollable
    }

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
        img.src = thumbnail.thumbnail_url;  
        img.setAttribute('data-id', thumbnail.id);
        img.setAttribute('discord_channel_id', thumbnail.discord_channel_id);
        img.setAttribute('discord_message_id', thumbnail.discord_message_id);
        img.style.display = 'block';
        img.width = 120;
        img.style.marginRight = '15px';
        img.style.borderRadius = '5px';
        img.style.cursor = 'pointer';
        img.className = 'thumbnail-image';
        img.setAttribute('data-src', thumbnail.thumbnail_url);
        img.onclick = function () {
            viewImageFullscreen(thumbnail.thumbnail_url, index, thumbnails);  // Ensure you're using the correct property from the thumbnail object
        };


         const desc = document.createElement('div');
        desc.innerText = thumbnail.video_title || "No Title Available"; // This is where you can define what is displayed in description next to image
        desc.style.flexGrow = '1';
        desc.style.fontFamily = "YouTube Sans, sans-serif";
        desc.style.fontSize = '15px';
        desc.className = 'description';

        container.appendChild(img);
        container.appendChild(desc);
        reviewBox.appendChild(container);
    });

    return reviewBox;
}

function cycleToNextThumbnail(img, thumbnails) {
    if (thumbnails[currentThumbnailIndex + 1]) {
        currentThumbnailIndex++;
        img.src = thumbnails[currentThumbnailIndex].thumbnail_url;
        return thumbnails[currentThumbnailIndex].thumbnail_url;  // Return the new imageUrl
    } else {
        const fullscreenDiv = document.getElementById('fullscreenDiv');
        if (fullscreenDiv) {
            document.body.removeChild(fullscreenDiv);
        }
        return null;
    }
}



function viewImageFullscreen(imageUrl, index, thumbnails) {
    const fullscreenDiv = document.createElement('div');
    fullscreenDiv.style.position = 'fixed';
    fullscreenDiv.style.top = '0';
    fullscreenDiv.style.left = '0';
    fullscreenDiv.style.width = '100vw';
    fullscreenDiv.style.height = '100vh';
    fullscreenDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    fullscreenDiv.style.zIndex = '2000';
    fullscreenDiv.style.display = 'flex';
    fullscreenDiv.style.justifyContent = 'center';
    fullscreenDiv.style.alignItems = 'center';
    fullscreenDiv.id = 'fullscreenDiv';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.src = thumbnails[index].thumbnail_url;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.borderRadius = '20px';
    img.style.marginRight = '20px';

    const approveBtn = document.createElement('button');
    approveBtn.innerText = '✔';
    approveBtn.style.backgroundColor = 'green';
    approveBtn.style.color = 'white';
    approveBtn.style.marginBottom = '10px';
    approveBtn.style.border = 'none';
    approveBtn.style.padding = '5px 10px';  // Increase the padding to make the button larger
    approveBtn.style.borderRadius = '4px';  // Round the button corners
    approveBtn.style.fontSize = '20px';  // Increase the font size for visibility
    approveBtn.onclick = function (event) {
        event.stopPropagation();
        console.log(imageUrl + ' approved');
        

        // Find the associated thumbnail element in the review box
        const associatedThumbnailElement = document.querySelector(`[data-src="${imageUrl}"]`);
 
        // Add the 'approved' class to the container of the associated thumbnail
        associatedThumbnailElement.closest('div').classList.add('approved');
    
        // Update the thumbnail status in the database
        const thumbnailId = associatedThumbnailElement.getAttribute('data-id'); // Assuming you have a data-id attribute on the thumbnail element
        updateThumbnailStatus(thumbnailId, 'approved');
    
        const newImageUrl = cycleToNextThumbnail(img, thumbnails);
        if (newImageUrl) {
        imageUrl = newImageUrl;
    }
};
        
    const reviseBtn = document.createElement('button');
    reviseBtn.innerText = '✖';
    reviseBtn.style.backgroundColor = 'red';
    reviseBtn.style.color = 'white';
    reviseBtn.style.border = 'none';
    reviseBtn.style.padding = '5px 10px';  // Increase the padding to make the button larger
    reviseBtn.style.borderRadius = '4px';  // Round the button corners
    reviseBtn.style.fontSize = '20px';  // Increase the font size for visibility
    reviseBtn.onclick = function (event) {
    event.stopPropagation();
    const comment = prompt('Enter your revision request:', '');
      if (comment) {
        console.log('Revision for ' + imageUrl + ':', comment);
            
          const associatedThumbnailElement = document.querySelector(`[data-src="${imageUrl}"]`);

          associatedThumbnailElement.closest('div').classList.add('revised');
        
          const thumbnailId = associatedThumbnailElement.getAttribute('data-id'); // Assuming you have a data-id attribute on the thumbnail element
          updateThumbnailStatus(thumbnailId, 'revised', comment);
 
          const newImageUrl = cycleToNextThumbnail(img, thumbnails);
          if (newImageUrl) {
            imageUrl = newImageUrl;
        }
    }
};

       const buttonContainer = document.createElement('div');
       buttonContainer.style.display = 'flex';
       buttonContainer.style.flexDirection = 'column';
       buttonContainer.style.alignItems = 'flex-end';  // Align buttons to the right
       buttonContainer.style.marginRight = '10px';  // Add some space on the right

       buttonContainer.appendChild(approveBtn);
       buttonContainer.appendChild(reviseBtn);

       fullscreenDiv.appendChild(img);
       fullscreenDiv.appendChild(buttonContainer);
       document.body.appendChild(fullscreenDiv);

       fullscreenDiv.addEventListener('click', function (event) {
       event.stopPropagation();  // Stop the event from propagating to the document
       fullscreenDiv.remove();
    });
}

function updateThumbnailStatus(thumbnailId, status, revisionComment = null) {
    const formData = new URLSearchParams();
    formData.append('thumbnail_id', thumbnailId);
    formData.append('status', status);
    if (revisionComment) {
        formData.append('revision_comment', revisionComment);
    }

    // First, update the database
    fetch('https://adloxs.marvelcrm.com/wp-content/plugins/adloxs/files/test.php?action=updateThumbnailStatus', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);

        // Retrieve associated thumbnail attributes
        const associatedThumbnailElement = document.querySelector(`[data-id="${thumbnailId}"]`);
        if (!associatedThumbnailElement) {
            console.error("Thumbnail element not found for thumbnailId:", thumbnailId);
            return;
        }

        const channelId = associatedThumbnailElement.getAttribute('discord_channel_id');
        const messageId = associatedThumbnailElement.getAttribute('discord_message_id');
        const imageUrl = associatedThumbnailElement.getAttribute('data-src');

        // Construct JSON data
        const requestData = {
            channelId: String(channelId),
            messageId: String(messageId),
            imageUrl: imageUrl,
            status: status
        };

        if (status === 'revised' && revisionComment) {
            requestData.revisionComment = revisionComment;
        }
        console.log("Sending data:", requestData);
        // Send JSON request to Discord update PHP script
        return fetch('https://adloxs.marvelcrm.com/wp-content/plugins/adloxs/files/discordupdate.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
    })
    .catch(error => {
        console.error("Error:", error);
    });
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
         #fullscreenDiv img.slide-in {
        animation: slideIn 0.5s forwards;
        }

        @keyframes slideIn {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(0);
        }
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
document.addEventListener('click', function (event) {
    const reviewBox = document.getElementById('adloxsReviewBox');
    const fullscreenDiv = document.getElementById('fullscreenDiv');

    if (reviewBoxVisible && reviewBox &&
        !reviewBox.contains(event.target) &&
        !event.target.matches('.reviewButton') &&
        (!fullscreenDiv || !fullscreenDiv.contains(event.target)) &&
        !fullscreenClicked) {  // Check the flag here
        reviewBox.remove();
        reviewBoxVisible = false;
    }
    fullscreenClicked = false;
});

document.addEventListener('DOMContentLoaded', addReviewButton);

const reviewButtonObserver = new MutationObserver(addReviewButton);
reviewButtonObserver.observe(document.body, { childList: true, subtree: true });

