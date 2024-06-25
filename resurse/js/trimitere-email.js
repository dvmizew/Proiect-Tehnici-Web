document.addEventListener('DOMContentLoaded', function() {
    const trimiteEmailBtn = document.getElementById('trimite-email');
    const selectNume = document.getElementById('select-nume');

    trimiteEmailBtn.addEventListener('click', function() {
        const selectedOptions = Array.from(selectNume.selectedOptions).map(option => option.value);

        selectedOptions.forEach(nume => {
            switch (nume) {
                case 'Irina Ciocan':
                    trimiteEmail('irina.ciocan@unibuc.ro');
                    break;
                case 'Irina Ciocan (gmail)':
                    trimiteEmail('irina.ciocan@gmail.com');
                    break;
                case 'Prof Prof Prof':
                    trimiteEmail('profprofprof007@gmail.com');
                    break;
                default:
                    console.log(`Adresa de email pentru ${nume} nu este definită.`);
                    break;
            }
        });
    });

    function trimiteEmail(adresaEmail) {
        const dataCurenta = new Date().toLocaleString('ro-RO');
        const jucariiSterse = JSON.parse(localStorage.getItem('jucariiSterse')) || [];

        const emailBody = `Data curentă: ${dataCurenta}\n\nLista jucăriilor șterse:\n${jucariiSterse.join('\n')}`;

        console.log(`Trimite email către ${adresaEmail}:\n${emailBody}`);
    }
});
