<script>
    import Chart from 'chart.js';
    import {onMount} from 'svelte';

    export let result;
    export let legend;
    export let type = 'line';
    let ctx;
    let lineChart;
    onMount(() => {
        ctx = document.getElementById('lineChart').getContext('2d');
        lineChart = new Chart(ctx, {
            type: type,
            data: {
                labels: [],
                datasets:[{
                    label: legend,
                    data: [],
                    borderColor: 'rgba(23,36,205, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    });
    $: if (ctx && result != null) {
        if ('labels' in result && result.labels.length == 1) {
            result.labels.push(result.labels[0]);
            result.dataset.push(result.dataset[0]);
        }
        lineChart.data.labels = result.labels;
        lineChart.data.datasets[0].data = result.dataset;
        lineChart.update();
    }
</script>

<div style="display: block; width: 100%; height: 100%;">
    <canvas id="lineChart"></canvas>
</div>