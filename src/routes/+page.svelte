<script lang="ts">

// http://musicbrainz.org/ws/2/release-group/?fmt=json&query=releasegroup:Telos AND artist:Zedd
// Remember to change los spaces for %20
// Then, for cover art: http://coverartarchive.org/release-group/d7367f12-e0d9-4dfa-8daa-84483a7faac2

const empty_disco = {
    artista: '',
    nombre: '',
    fecha_lanzamiento: ''
};
let nuevo_disco = $state(empty_disco);
let nuevo_disco_parsed = $derived.by(() => {
    let snap = $state.snapshot(nuevo_disco);
    for (const key in snap) {
        snap[key] = snap[key].trim();
        if (snap[key] === '') {
            snap[key] = null;
        }
    }
    return snap;
})

let lista_discos = $state([]);

let resultados_musicbrainz = $state(null);



function validate_form(submitted_disco) {
    let ok = true;
    // let submitted_disco = $state.snapshot(nuevo_disco_parsed);
    for (const key in submitted_disco) {
        if (submitted_disco[key] === null && key !== 'fecha_lanzamiento') {
            ok = false;
            alert('Por favor complete todos los campos');
        }
    }
    return ok;
}

function handleOnSubmit(event) {
    event.preventDefault();
    const form = event.target;

    let submitted_disco = $state.snapshot(nuevo_disco_parsed);
    validate_form(submitted_disco);
    
    lista_discos.push(submitted_disco);
    // reset form
    nuevo_disco = empty_disco;
    last_submit = submitted_disco;
}

function handleBuscar(event) {
    event.preventDefault();
    let submitted_disco = $state.snapshot(nuevo_disco_parsed);
    let form_ok = validate_form(submitted_disco);
    if (!form_ok) {
        return;
    }

    // http://musicbrainz.org/ws/2/release-group/?fmt=json&query=releasegroup:Telos AND artist:Zedd
    let query = `releasegroup:${submitted_disco.nombre} AND artist:${submitted_disco.artista}`;
    fetch(`http://musicbrainz.org/ws/2/release-group/?fmt=json&query=${query}`)
        .then(response => response.json())
        .then(data => {
            resultados_musicbrainz = data;
        });

}

let last_submit = $state({});


</script>

{#snippet disco(info_disco)}
    <div class='disco'>
    <img />
    <div>
        <h3>{info_disco.artista} - {info_disco.nombre}</h3>
        {#if info_disco.fecha_lanzamiento}
            <p>{info_disco.fecha_lanzamiento}</p>
        {:else}
            <p>Fecha de lanzamiento desconocida</p>
        {/if}
    </div>
</div>
{/snippet}

<h1>Calendario de discos</h1>


<form>
    <label for="artista">Artista</label>
    <input type="text" name="artista" bind:value={nuevo_disco.artista}/>

    <label for="nombre">Disco</label>
    <input type="text" name="nombre" bind:value={nuevo_disco.nombre}/>

    <!-- <label for="fecha_lanzamiento">Fecha de lanzamiento</label>
    <input type="date" name="fecha_lanzamiento" bind:value={nuevo_disco.fecha_lanzamiento}/> -->

    <button type="submit" onclick={handleBuscar}>Buscar</button>
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

<div class='disco'>
    <img class='disco-img-size' src="https://ia902203.us.archive.org/7/items/mbid-fc863ed0-e7f4-4689-9f9d-fd18ebfed033/mbid-fc863ed0-e7f4-4689-9f9d-fd18ebfed033-39142166955_thumb250.jpg"/>
    <div>
        <h3>Zedd - Telos</h3>
        <p>2024-08-30</p>
    </div>
</div>

<h2>Resultados de busqueda</h2>
{#if resultados_musicbrainz !== null}
    {resultados_musicbrainz.count} resultado{#if resultados_musicbrainz.count !== 1}s{/if}
    {#each resultados_musicbrainz['release-groups'] as rg}
        <div class='disco'>
            <!-- <img src="http://coverartarchive.org/release-group/{rg.id}"/> -->
            <div class='disco-img-size'></div>
            <div>
                <h3>{rg['artist-credit'][0].name} - {rg.title}</h3>
                {#if rg['first-release-date']}
                    <p>{rg['first-release-date']}</p>
                {:else}
                    <p>Fecha de lanzamiento desconocida</p>
                {/if}
            </div>
        </div>
    {/each}
    
{/if}
<div class='disco'>
    <!-- <img src="http://coverartarchive.org/release-group/{rg.id}"/> -->
    <div class='disco-img-size' style='background-color: lightgray;'/>
    <div>
        <h3>Artista - Disco</h3>
        
        <p>2024-01-23</p>
        
    </div>
</div>
<br/>
{JSON.stringify(resultados_musicbrainz)}

<style>
.disco {
    display: flex;
}
.disco-img-size {
    width: 100px;
    height: 100px;
    object-fit: cover;
    margin-right: 10px;
}
input {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
}
</style>