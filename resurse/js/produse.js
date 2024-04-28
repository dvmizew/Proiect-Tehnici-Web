window.addEventListener("load", function () {
    document.getElementById("inp-pret").onchange = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    }
    document.getElementById("filtrare").onclick = function () {
        var inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();

        // var radioCalorii = document.getElementsByName("gr_rad"); // DE SCHIMBAT
        // let inpCalorii;
        // for (let rad of radioCalorii) {
        //     if (rad.checked) {
        //         inpCalorii = rad.value;
        //         break;
        //     }
        // }
        // let minCalorii, maxCalorii;
        // if (inpCalorii != "toate") {
        //     vCal = inpCalorii.split(":");
        //     minCalorii = parseInt(vCal[0]);
        //     maxCalorii = parseInt(vCal[1]);
        // }

        var inpPret = parseInt(document.getElementById("inp-pret").value);
        var inpCateg = document.getElementById("inp-categorie").value.toLowerCase().trim();
        var produse = document.getElementsByClassName("produs");

        for (let produs of produse) {
            let valNume = produs.getElementsByClassName("val-nume")[0].innerText.toLowerCase().trim();
            let valPret = parseInt(produs.getElementsByClassName("val-pret")[0].innerText);
            let valCategorie = produs.getElementsByClassName("val-categorie")[0].innerText.toLowerCase().trim();
            let cond1 = valNume.startsWith(inpNume);
            let cond2 = (valPret >= inpPret);
            let cond3 = (inpCateg === "toate" || inpCateg === valCategorie);

            if (cond1 && cond2 && cond3) {
                produs.style.display = "block";
            } else {
                produs.style.display = "none";
            }
        }
    }

    document.getElementById("resetare").onclick = function () {
        document.getElementById("inp-nume").value = "";
        document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
        document.getElementById("inp-categorie").value = "toate";
        var produse = document.getElementsByClassName("produs");
        document.getElementById("infoRange").innerHTML = "(0)";

        for (let prod of produse) {
            prod.style.display = "block";
        }
    }
});