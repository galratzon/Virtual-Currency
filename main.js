/// <reference path="jquery-3.5.1.js" />
"use strict";

$(function ($) {

    $("#aboutMe").hide();
    

    $('a').on('click', function (e) {
        e.preventDefault();
        const pageRef = $(this).attr('href');
        
        if(pageRef == "aboutMe.html" ){

            $("#search").hide();
            $("#btnSearch").hide();
            $(".mainContent").hide();
            $("#aboutMe").show();
        }
        if(pageRef == "index.html" ){
            $('#aboutMe').hide();
            $("#search").show();
            $("#btnSearch").show();
            $(".mainContent").show();
            $(".allCoins").empty();
            getCoins();
            setTimeout(() => updateAllUi()
                ,200);
        }
    });


    //parallax Image 
    function parallax_height() {
        let scroll_top = $(this).scrollTop();
        let header_height = $(".sample-header-section").outerHeight();
        $(".sample-section").css({ "margin-top": header_height });
        $(".sample-header").css({ height: header_height - scroll_top });
    }

    parallax_height();
    $(window).scroll(function () {
        parallax_height();
    });

    $(window).resize(function () {
        parallax_height();
    });

    // General Function for AJAX GET Request 
    function getJsonAsync(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                success: data => resolve(data),
                error: err =>{
                    if(err.status==404) {
                        alert("The information about the coins could not be found, please try again");
                        spinnerOff();
                    } },
                reject: err => reject(err)
            });
        });
    }


    //call to first api get all coins- https://api.coingecko.com/api/v3/coins/list
    async function getCoins(search = 0) {
        try {
            spinnerOn();
            const coinsDetails = await getJsonAsync(`https://api.coingecko.com/api/v3/coins/list`);
            let counter = 1;
            let containAllCoins = '';

            for (let details in coinsDetails) {
                if (coinsDetails[details].id !== "") { 
                    let containsCoin = `
                    <div class="card text-end">
                        <div class="custom-control custom-switch">
                            <input type="checkbox" class="custom-control-input" id="Switch_${coinsDetails[details].id}">
                            <label class="custom-control-label" for="Switch_${coinsDetails[details].id}"></label>
                            <label class = "notDisplay">${coinsDetails[details].name}</label>
                        </div>

                        <div class="card-input">
                            <h5 class="card-title"> ${coinsDetails[details].symbol}</h5>
                            <p class="card-text"> ${coinsDetails[details].name}</p>                       
                            <button id=${coinsDetails[details].id} class="btn btn-warning" data-toggle="collapse" data-target="#collapse_${coinsDetails[details].id}">More Info</button>
                            <div id=collapse_${coinsDetails[details].id} class="collapse"></div>
                            </div>       
                        </div>
                    </div>`

                    if (search !== 0) {
                        if (coinsDetails[details].symbol === search || coinsDetails[details].symbol.toUpperCase() === search) {
                            $(".allCoins").empty();
                            $(".allCoins").append(containsCoin);
                            updateAllUi();
                            spinnerOff();
                            return;
                        }
                        if (counter === 99) {
                            spinnerOff();
                            setTimeout(() => {
                                alert("Sorry, We did not find any coins at this mark");
                            }, 200);
                            return;
                        }
                    }
                    if (coinsDetails[details].symbol.length <= 3) {
                        containAllCoins += containsCoin;
                        counter++;
                    }

                    if (counter >= 100) {
                        $(".allCoins").append(containAllCoins);
                        spinnerOff();
                        return;
                    }
                }
            }
        }
        catch (err) {
            alert("Error: " + err);
        }
    }

    getCoins();


    // Resat All Session storage lists 
    const arrNameCoins = [];
    const arrIdCoins = [];
    const removeCoins = [];
    sessionStorage.setItem("selectedCurrenciesName", JSON.stringify(arrNameCoins));
    sessionStorage.setItem("selectedCurrenciesId", JSON.stringify(arrIdCoins));
    sessionStorage.setItem("removeCoins", JSON.stringify(removeCoins));

  
    //Add Selected checkbox to session storage and open window if more then 5 selected
    $("section").on('click', '[type=checkbox]', function () {

        const switchCoinsId = $(this).attr("id");
        const switchCoinsName = $(this).next().next().text();
        let arrNameCoins = JSON.parse(sessionStorage.getItem("selectedCurrenciesName"));
        let arrIdCoins = JSON.parse(sessionStorage.getItem("selectedCurrenciesId"));
        const indexId = arrIdCoins.indexOf(switchCoinsId);
        const indexName = arrNameCoins.indexOf(switchCoinsName);

        if (arrNameCoins === null && arrIdCoins === null) {
            arrNameCoins = [];
            arrIdCoins = [];
        }

        if (indexId > -1) {
            arrIdCoins.splice(indexId, 1);
            arrNameCoins.splice(indexName, 1);
        }
        else {
            arrNameCoins.push(switchCoinsName);
            arrIdCoins.push(switchCoinsId);
        }

        sessionStorage.setItem("selectedCurrenciesName", JSON.stringify(arrNameCoins));
        sessionStorage.setItem("selectedCurrenciesId", JSON.stringify(arrIdCoins));

        if (arrNameCoins.length > 5) {
            displayModalWindow(arrNameCoins, arrIdCoins);
        }

    });


    //Display Window with all selected Coins and Remove one of the option from Session storage
    function displayModalWindow(arrNameCoins, arrIdCoins) {

        let containCoins = '';
        for (let i = 0; i < arrNameCoins.length; i++) {
            containCoins += `
            <div class="custom-control custom-switch">
            <li>${arrNameCoins[i]}</li>
            <input type="checkbox" onclick="removeOrAddCoins(this);" class="custom-control-input" checked id="selected_${arrIdCoins[i]}">
            <label class="custom-control-label customSwitch" for="selected_${arrIdCoins[i]}"></label>
            </div>`
        }

        $(".listol").empty();
        $(".listol").append(containCoins);
        $('#model').trigger('click');
    }


    //Save the more info about coin in Cookie for 2 minute 
    function setCookie(buttonId, moreInfoAboutCoin) {
        try {
            if (moreInfoAboutCoin === undefined) {
                return;
            }
            const dateTime = new Date();
            dateTime.setMinutes(dateTime.getMinutes() + 1);
            document.cookie = `${buttonId}=` + moreInfoAboutCoin + ";Expires=" + dateTime.toUTCString();
        }
        catch (err) {
            console.log("Error with info value: " + err)
        }
    }

    
    function getCookie(cookieName) {
        const arr = document.cookie.split(';')
        for (const coin of arr) {
            let newCoin = coin.split('=');
            const name = newCoin[0].trim();
            const value = newCoin[1] + "=" + newCoin[2];
            if (name === cookieName) {
                return value;
            }
        }
    }


    // call to second api for get more info: https://api.coingecko.com/api/v3/coins/01coin 
    $("section").on('click', 'button', async function () {
        try {
            spinnerOn();
            const buttonId = $(this).attr("id");
            let moreInfoAboutCoin = '';
            $(this).next().empty(); 
            if (document.cookie.indexOf(buttonId) !== -1) {
                moreInfoAboutCoin = getCookie(buttonId);
            } else {
                const coinDetails = await getJsonAsync(`https://api.coingecko.com/api/v3/coins/${buttonId}`);
                moreInfoAboutCoin = `<img src="${coinDetails.image.small}"><br><div> &#x24 ${coinDetails.market_data.current_price.usd} <br> &#8364 ${coinDetails.market_data.current_price.eur}  <br> &#8362 ${coinDetails.market_data.current_price.ils}  <br>`
            }
            spinnerOff();
            $(this).next().append(moreInfoAboutCoin);
            setCookie(buttonId, moreInfoAboutCoin); // set the info to cookie or update the expires date
        }
        catch (err) {
            console.log("Error: " + err);
        }
    });


    //Validation for Input Search
    $("#btnSearch").click(function () {
        try {
            spinnerOn();
            const searchValue = $("#search").val();
            if (searchValue.length > 3) {
                alert("Sorry, We did not find any coins at this mark");
            }
            else {
                getCoins(searchValue);
            }
            spinnerOff();
        }
        catch (err) {
            alert(`Sorry, an error occurred. Refresh and try again \nError: ${err}`)
        }
    });


    // Show/Hide Spinner when the page is lodging...
    function spinnerOn() {
        $("span").removeClass('hideLoadingDiv').addClass('loadingDiv');
        
    }
    function spinnerOff() {
        $("span").removeClass('loadingDiv').addClass('hideLoadingDiv');
    }


});

//Remove Or add toggle coins from model window
function removeOrAddCoins(coinSelected) {

    let arrNameCoins = JSON.parse(sessionStorage.getItem("selectedCurrenciesName"));
    let arrIdCoins = JSON.parse(sessionStorage.getItem("selectedCurrenciesId"));
    let removeCoins = JSON.parse(sessionStorage.getItem("removeCoins"));

    const indexId = arrIdCoins.indexOf(coinSelected.id.substring(9));
    const indxRemoveId = removeCoins.indexOf(coinSelected.id);

    if (indexId > -1) {
        removeCoins.push(arrIdCoins[indexId]);
        arrNameCoins.splice(indexId, 1);
        arrIdCoins.splice(indexId, 1);
        sessionStorage.setItem("selectedCurrenciesName", JSON.stringify(arrNameCoins));
        sessionStorage.setItem("selectedCurrenciesId", JSON.stringify(arrIdCoins));
        sessionStorage.setItem("removeCoins", JSON.stringify(removeCoins));
    }
    else {
        arrNameCoins.push(coinSelected.id.substring(16));
        arrIdCoins.push(coinSelected.id.substring(9));
        removeCoins.splice(indxRemoveId, 1);
        sessionStorage.setItem("selectedCurrenciesName", JSON.stringify(arrNameCoins));
        sessionStorage.setItem("selectedCurrenciesId", JSON.stringify(arrIdCoins));
        sessionStorage.setItem("removeCoins", JSON.stringify(removeCoins));
    }
    
    updateUiRemove(removeCoins, this);
}


//Update Ui if User want Cancel her choice
function updateUiRemove(removeCoins=0, that){
    console.log(that);
    if(that === undefined){
        for (let switchCoin in removeCoins){
            $(`#${removeCoins[switchCoin]}`).prop('checked', false); 
        }
        let arrIdCoins = JSON.parse(sessionStorage.getItem("selectedCurrenciesId"));
        for (let switchCoin in arrIdCoins){
            $(`#${arrIdCoins[switchCoin]}`).prop('checked', true); 
        }
    }
    else{
        const removeCoins = JSON.parse(sessionStorage.getItem("removeCoins"));
        for (let switchCoin in removeCoins){
            $(`#${removeCoins[switchCoin]}`).prop('checked', true); 
        } 
        sessionStorage.setItem("removeCoins", JSON.stringify([]));
    }
}

function updateAllUi(){
    const arrIdCoins = JSON.parse(sessionStorage.getItem("selectedCurrenciesId"));
    const removeCoins = JSON.parse(sessionStorage.getItem("removeCoins"));

    if (arrIdCoins.length !== 0){
        for (let switchCoin in arrIdCoins){
            $(`#${arrIdCoins[switchCoin]}`).prop('checked', true); 
        } 
   }
   if (removeCoins.length !== 0){
        for (let switchCoin in removeCoins){
            $(`#${removeCoins[switchCoin]}`).prop('checked', false); 
        } 
    }
    
}

//Update ui with selected coins
function saveChangesUi(){
    sessionStorage.setItem("removeCoins", JSON.stringify([]));
}
