document.addEventListener("DOMContentLoaded", () => {
    onst form = document.getElementById("addClassificationForm");
    const navContainer = document.getElementById("navContainer"); // make sure your nav has this ID

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = document.getElementById("classification_name");
        const name = input.value.trim();

    if (!/^[A-Za-z0-9_-]+$/.test(name)) {
        alert("Invalid classification name. No spaces or special characters allowed.");
        return;
    }

    try {
        const response = await fetch("/inv/add-classification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classification_name: name })
        });

    const data = await response.json();

    if (data.success) {
        // Clear input
        input.value = "";

        // Update nav dynamically
        navContainer.innerHTML = "";
        data.nav.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item.classification_name;
        navContainer.appendChild(li);
        });

        alert(data.message); // optional success message
    } else {
        alert(data.errors.join("\n"));
    }
    } catch (err) {
        console.error(err);
        alert("Something went wrong.");
    }
    });
});

//Get a list of vehicles in inventory based on the classification_id
let classificationList = document.querySelector("#classificationList")
classificationList.addEventListener("change", function(){
    let classification_id = classificationList.value
    console.log(`classificationID is: ${classification_id}`)
    let classIdURL = "/inv/getInventory/" + classification_id
    fetch(classIdURL)
        .then(function (response){
            if (response.ok) {
                return response.json()
            }
            throw Error("Network response was not OK")
        })
        .then(function(data){
            console.log(data)
            buildInventoryList(data)
        })
        .catch(function(error){
            console.log("Json fetch error:", error.message)
            throw Error('Fetch of JSON data failed')
        })
})

//Build inventory items into HTML table components and inject into DOM
function buildInventoryList (data) {
    let inventoryDisplay = document.getElementbyID("inventoryDisplay")
    // Set up the table labels
    let dataTable = "<thead>"
    dataTable += "<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>"
    dataTable += "<thead>"
    //Set up the table body
    dataTable += "<tbody>"
    //Iterate over all vehicles in the array and put each in a row
    data.forEach(function(element){
        console.log(element.inv_id + ","+ element.inv_model)
        dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`
        dataTable +=`<td><a href='/inv/edit/${element.inv_id}' title='Click to 
        update'>Modify</a></td>`
        dataTable += `<td><a href-'/inv/delete/${element.inv_id}' tile='Click to 
        delete'>Delete</a></td></tr>`
    })
    dataTable +="</tbody>"
    //display the contents in the Inventory Management view
    inventoryDisplay.innerHTML = dataTable
}