<script>

let nuevo_disco = $state({
    artista: '',
    nombre: '',
    fecha_lanzamiento: ''
});

let lista_discos = $state([]);

function handleOnSubmit(event) {
    event.preventDefault();
    for (const key in nuevo_disco) {
        nuevo_disco[key] = nuevo_disco[key].trim();
    }
    last_submit = $state.snapshot(nuevo_disco);
    lista_discos.push(last_submit);
}

let last_submit = $state({});


</script>

{#snippet disco(info_disco)}
    <div>
        <h3>{info_disco.artista} - {info_disco.nombre}</h3>
    </div>
{/snippet}

<h1>Calendario de discos</h1>


<form>
    <label for="artista">Artista</label>
    <input type="text" name="artista" bind:value={nuevo_disco.artista}/>

    <label for="nombre">Nombre</label>
    <input type="text" name="nombre" bind:value={nuevo_disco.nombre}/>

    <label for="fecha_lanzamiento">Fecha de lanzamiento</label>
    <input type="date" name="fecha_lanzamiento" bind:value={nuevo_disco.fecha_lanzamiento}/>

    <button type="submit" onclick={handleOnSubmit}>Guardar</button>
</form>

<br/>
{JSON.stringify(nuevo_disco)}
<br/>
Last submit: {JSON.stringify(last_submit)}

<h2>Discos</h2>
{#each lista_discos as d}
    {@render disco(d)}
{/each}

<style>
input {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
}
</style>