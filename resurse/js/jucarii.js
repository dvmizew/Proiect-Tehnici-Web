function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', options);
}

document.addEventListener('DOMContentLoaded', function() {
    const sorteazaBtn = document.getElementById('sorteaza');
    const filtreazaBtn = document.getElementById('filtreaza');
    const filtruPretCheckbox = document.getElementById('filtru-pret');
    const sortareSelect = document.getElementById('sortare');
    const jucariiArticles = document.querySelectorAll('.grid-jucarii article');
    const jucariiSterseParagraf = document.getElementById('jucarii-sterse');
    const resetLocalStorageBtn = document.getElementById('reset-localstorage');

    function sorteazaJucarii(sortare) {
        const sortedJucarii = Array.from(jucariiArticles).sort((a, b) => {
            const aCulori = parseInt(a.dataset.culori);
            const bCulori = parseInt(b.dataset.culori);
            if (aCulori !== bCulori) {
                return sortare === 'ascendent' ? aCulori - bCulori : bCulori - aCulori;
            } else {
                const aPret = parseInt(a.dataset.pret);
                const bPret = parseInt(b.dataset.pret);
                return sortare === 'ascendent' ? aPret - bPret : bPret - aPret;
            }
        });

        const gridJucarii = document.querySelector('.grid-jucarii');
        sortedJucarii.forEach(jucarie => gridJucarii.appendChild(jucarie));
    }

    function filtreazaJucarii() {
        const filtrat = filtruPretCheckbox.checked;

        jucariiArticles.forEach(jucarie => {
            const valoarePret = parseInt(jucarie.dataset.pret);
            if (filtrat) {
                jucarie.style.display = valoarePret > 0 ? 'block' : 'none';
            } else {
                jucarie.style.display = 'block';
            }
        });
    }

    function stergeJucarie(event) {
        const article = event.target.closest('article');
        if (!article) return;

        const jucarieId = article.dataset.id;
        const jucariiSterse = JSON.parse(localStorage.getItem('jucariiSterse')) || [];

        if (!jucariiSterse.includes(jucarieId)) {
            jucariiSterse.push(jucarieId);
            localStorage.setItem('jucariiSterse', JSON.stringify(jucariiSterse));

            updateJucariiSterseParagraf();
        }

        article.style.display = 'none';
    }

    function updateJucariiSterseParagraf() {
        const jucariiSterse = JSON.parse(localStorage.getItem('jucariiSterse')) || [];
        if (jucariiSterse.length > 0) {
            jucariiSterseParagraf.textContent = `Jucăriile șterse: ${jucariiSterse.join(', ')}`;
        } else {
            jucariiSterseParagraf.textContent = 'Nu există jucării șterse.';
        }
    }

    function resetLocalStorage() {
        localStorage.removeItem('jucariiSterse');
        jucariiArticles.forEach(jucarie => {
            jucarie.style.display = 'block';
        });
        updateJucariiSterseParagraf();
    }

    sorteazaBtn.addEventListener('click', function() {
        const sortare = sortareSelect.value;
        sorteazaJucarii(sortare);
    });

    filtreazaBtn.addEventListener('click', function() {
        filtreazaJucarii();
    });

    resetLocalStorageBtn.addEventListener('click', function() {
        resetLocalStorage();
    });

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('sterge')) {
            stergeJucarie(event);
        }
    });

    updateJucariiSterseParagraf();

    // titluri
    const titluriJucarii = document.querySelectorAll('.titlu');

    titluriJucarii.forEach(titlu => {
        const paragrafPret = titlu.nextElementSibling.querySelector('.pret');

        titlu.addEventListener('mouseenter', function() {
            paragrafPret.classList.add('hovered');
        });

        titlu.addEventListener('mouseleave', function() {
            paragrafPret.classList.remove('hovered');
        });
    });
});
