//This JS provides functions for pseudo-functionality for certain kinds of buttons.
// Switch statements: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch
// setTimeout: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout

//UPDATED
function confirmDelete(project_name, project_id, redirect_to){
    if(confirm(`Are you sure you want to delete the project ${project_name} (id ${project_id})? This is PERMANENT and cannot be undone.`)) {
        // Send AJAX DELETE request to the appropriate URL
        // fetch is asynchronous, and uses the Promise Syntax for handling.
        // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        fetch(`/projects/${project_id}`,{
            method: 'DELETE'
        })
        .then(response => {
            //Check for 200-level success code, like 204 (Success No Content)
            if (response.ok) {
                alert(`Successfully deleted the project ${project_name} (id ${project_id}).`);
                //What to do next is not widely agreed upon, but some kind of redirect (say, to the projects page) seems appropriate?
                window.location.href = redirect_to || window.location.href;
            }
            //Other codes like 404 indicate failure
            else {
                alert(`Failed to delete the project ${project_name} (id ${project_id}) - could not find?`);
            }
        })
        .catch(error => {
            // Only fails if network error, such as no response (timed out).
            alert(`ERROR: Network error, failed to delete the project ${project_name} (id ${project_id}).`)
        })

    }
}

function toggleInterest(interestButton, project_id){
    let interestButtonIcon = interestButton.children[0];
    switch(interestButtonIcon.textContent) {
    case "star_border": //currently off, toggle on.
        console.log("Toggle On!")
        interestButton.classList.replace("scale-in", "scale-out");
        
        //Send update to server, wait for confirmation before showing on button
        //Simulate waiting with a timeout for now...
        setTimeout(function(){
            interestButtonIcon.textContent = "star";
            interestButton.classList.replace("blue", "yellow");
            interestButton.classList.replace("scale-out", "scale-in");
        }, 500);
        
    break;
    case "star": //currently on, toggle off
        console.log("Toggle Off!")
        interestButton.classList.replace("scale-in", "scale-out");

        //Send update to server, wait for confirmation before showing on button
        //Simulate waiting with a timeout for now...
        setTimeout(function(){
            interestButtonIcon.textContent = "star_border";
            interestButton.classList.replace("yellow", "blue");
            interestButton.classList.replace("scale-out", "scale-in");
        }, 500);
    break;
    default: //currently in star_half, processing... don't do anything yet.
    }
    //Until server response comes, show a "processing" symbol - which means clicking does nothing until response comes.
    interestButtonIcon.textContent = "star_half";
}
