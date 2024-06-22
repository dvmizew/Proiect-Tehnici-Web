function culoareRandom() {
	randInt = (a = 0, b = 256) => Math.random() * (b - a) + a; // [0,1) -> [0, b-a) -> [a,b)
	return `rgb(${randInt()},${randInt()},${randInt()})`;
}
let chartFacturi = null;

async function creareGraficExemplu() {
	const zile = {
		luni: 30,
		marti: 20,
		miercuri: 15,
		joi: 10,
		vineri: 8,
		sambata: 2,
		duminica: 15
	}
	new Chart(
		document.getElementById('container-grafic'),
		{
			type: 'polarArea',
			data: {
				labels: Object.keys(zile),
				datasets: [
					{
						label: 'Nivel de stres',
						data: Object.values(zile),
						backgroundColor: [
							'red',
							'green',
							'blue',
							'pink',
							'orange',
							'fuchsia',
							'skyblue'
						]
					}
				]
			}
		}
	);
}

async function creareGraficFacturi(dateGrafic) {
	let culoriRandom = [];
	for (let _ in dateGrafic) culoriRandom.push(culoareRandom());
	if (!chartFacturi) {
		chartFacturi = new Chart(
			document.getElementById('grafic-facturi'),
			{
				type: 'bar',
				data: {
					labels: [], //Object.keys(dateGrafic),
					datasets: [
						{
							label: 'Numar vanzari:',
							data: [], //Object.values(dateGrafic),
							backgroundColor: [] //culoriRandom
						}
					]
				}
			}
		);
	}
	else {
		let date = Array.from(chartFacturi.data.datasets[0].data);
		chartFacturi.data.labels.splice(0, chartFacturi.data.labels.length)
		chartFacturi.data.labels = Object.keys(dateGrafic);
		chartFacturi.data.datasets[0].data.splice(0, chartFacturi.data.datasets[0].data.length)
		let culoriOrdonate = []
		Object.values(dateGrafic).forEach((val, i) => {
			chartFacturi.data.datasets[0].data.push(val);
			culoriOrdonate.push(culoriDate[Object.keys(dateGrafic)[i]])
		});
		chartFacturi.data.datasets[0].backgroundColor = culoriOrdonate;
		chartFacturi.update();
	}
}


let culoriDate = {}
function actualizeazaDateFacturi() {
	fetch("/update_grafice", {

		method: "GET",
		headers: { 'Content-Type': 'application/json' },

		mode: 'cors',
		cache: 'default'
	})
		.then(function (rasp) { console.log(rasp); x = rasp.json(); console.log(x); return x })
		.then(function (obFacturi) {
			console.log(obFacturi);
			let dateGrafic = {}
			for (let factura of obFacturi) {
				for (let poza of factura.produse) {
					dateGrafic[poza.nume] = dateGrafic[poza.nume] ? dateGrafic[poza.nume] + 1 : 1
					if (!culoriDate[poza.nume]) culoriDate[poza.nume] = culoareRandom();
				}
			}
			creareGraficFacturi(dateGrafic);
		})
}

window.addEventListener("load", function () {
	creareGraficExemplu();
	actualizeazaDateFacturi();
	setInterval(actualizeazaDateFacturi, 5000);
})