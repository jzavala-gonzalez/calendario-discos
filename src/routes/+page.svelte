<script lang="ts">
    import '@fontsource/inter';

    import {onMount} from 'svelte';
    import Disco from '$lib/components/Disco.svelte';

    onMount(() => {
        const stored_data = localStorage.getItem('lista_discos');
        const stored_coverart_api_cache = localStorage.getItem('coverart_api_cache')
        if (stored_data !== null) {
            lista_discos = JSON.parse(stored_data)
        }
        if (stored_coverart_api_cache !== null) {
            coverart_api_cache = JSON.parse(stored_coverart_api_cache)
        }
        loaded_data = true;
    })

// http://musicbrainz.org/ws/2/release-group/?fmt=json&query=releasegroup:Telos AND artist:Zedd
// Remember to change los spaces for %20
// Then, for cover art: http://coverartarchive.org/release-group/d7367f12-e0d9-4dfa-8daa-84483a7faac2

type MusicBrainzData = {
    release_group_id: string | null,
}

type DiscoType = {
    id: number,
    artista: string,
    nombre: string,
    fecha_lanzamiento: string,

    musicbrainz: MusicBrainzData,

    // CoverArt Archive
    // TODO: Add
}

const empty_musicbrainz: MusicBrainzData = {
    release_group_id: null,
}
const empty_disco: DiscoType = {
    id: -1,
    artista: '',
    nombre: '',
    fecha_lanzamiento: '',
    musicbrainz: empty_musicbrainz,
};

let loaded_data = $state(false);

let nuevo_disco = $state(empty_disco);
let nuevo_disco_parsed = $derived.by(() => {
    let snap = $state.snapshot(nuevo_disco);
    for (const key in snap) {
        if (typeof snap[key] !== 'string') continue;
        snap[key] = snap[key].trim();
        if (snap[key] === '') {
            snap[key] = null;
        }
    }
    return snap;
})

let lista_discos: DiscoType[] = $state([
    {
        id: 0,
        artista: 'Artista',
        nombre: 'Disco',
        fecha_lanzamiento: '',
        musicbrainz: {
            release_group_id: null,
        }
    }
]);
let lista_discos_sorted = $derived.by(() => {
    const sorted_discos = lista_discos.toSorted(
        (a,b) => {
            let a_fecha = a.fecha_lanzamiento;
            let b_fecha = b.fecha_lanzamiento;

            if (a_fecha === null) {a_fecha = '9999'};
            if (b_fecha === null) {b_fecha = '9999'};

            
            return a_fecha > b_fecha ? 1 : -1
            
        }
    )
    return sorted_discos
})

$effect(() => {
    if (loaded_data) {
        localStorage.setItem('lista_discos', JSON.stringify(lista_discos))
        localStorage.setItem('coverart_api_cache', JSON.stringify(coverart_api_cache))
    }
})

let next_id = $derived.by(() => {
    const num_discos = lista_discos.length;
    if ((num_discos) === 0) return 0;
    const used_ids = lista_discos.map(d => d.id);
    return Math.max(...used_ids)+1
})

let id_to_index = $derived.by(() => {
    const thedict = {}
    lista_discos.forEach((d,i) => {
        thedict[d.id] = i
    })
    return thedict
})

let show_resultados = $state(false);
let resultados_musicbrainz: any = $state(null);

let coverart_api_cache = $state({});
$effect(() => {
    if (resultados_musicbrainz === null) return;
    const release_groups = resultados_musicbrainz['release-groups']
    for (let rg of release_groups) {
        const rg_id = rg.id;
        if (rg_id in coverart_api_cache) continue;

        fetch(`http://coverartarchive.org/release-group/${rg_id}`)
        .then(response => response.json())
        .then(data => {
            coverart_api_cache[rg_id] = data;
        });
    }
})

function borrar_disco(id: number) {
    lista_discos.splice(id_to_index[id],1)
}

function editar_disco(id: number) {
    nuevo_disco = $state.snapshot(lista_discos[id_to_index[id]])
}

function musicbrainz_to_disco(release_group) {
    let disco = structuredClone(empty_disco)

    const rg_id = release_group.id;
    const fecha_lanzamiento = release_group['first-release-date'];
    const nombre = release_group.title;
    const artista = release_group['artist-credit'][0].name

    disco.musicbrainz.release_group_id = rg_id;
    disco.artista = artista;
    disco.nombre = nombre;
    disco.fecha_lanzamiento = fecha_lanzamiento;

    return disco;
}

function seleccionar_resultado(release_group) {
    const nuevo_disco_id = nuevo_disco.id;
    nuevo_disco = musicbrainz_to_disco(release_group);
    nuevo_disco.id = nuevo_disco_id

    submit_form();
}

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

function submit_form() {
    let submitted_disco = $state.snapshot(nuevo_disco_parsed);
    let ok = validate_form(submitted_disco);
    if (!ok) return;

    if (submitted_disco.id in id_to_index) {
        lista_discos[id_to_index[submitted_disco.id]] = submitted_disco
    } else {
        submitted_disco.id = next_id
        lista_discos.push(submitted_disco);
    }

    // reset form
    nuevo_disco = empty_disco;
    last_submit = submitted_disco;

    show_resultados = false;
}

function handleOnSubmit(event) {
    event.preventDefault();
    submit_form();
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
            show_resultados = true;
        });

}

let last_submit = $state({});


</script>

{#snippet disco(info_disco)}
    <div class='disco'>
        {#if info_disco.musicbrainz.release_group_id in coverart_api_cache}
        <img class='disco-img-size' alt={'album cover art'} src={coverart_api_cache[info_disco.musicbrainz.release_group_id].images[0].thumbnails.small}/>
        {:else}
        <div class='disco-img-size' style='background-color: lightgray;'></div>
        {/if}
    <div class='disco-detalles'>
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

<!-- <br/>
{JSON.stringify(nuevo_disco)}
<br/>
Last submit: {JSON.stringify(last_submit)}
Next id: {next_id}
Id to index: {JSON.stringify(id_to_index)}
<br/> -->
<!-- CoverArt API Cache: {JSON.stringify(coverart_api_cache)} -->

{#if show_resultados}
<h2>Resultados de busqueda</h2>
{#if resultados_musicbrainz !== null}
    {resultados_musicbrainz.count} resultado{#if resultados_musicbrainz.count !== 1}s{/if}
    {#each resultados_musicbrainz['release-groups'] as rg}
        <div class='disco-container'>

            {#snippet acciones()}
            <button onclick={() => seleccionar_resultado(rg)}>Seleccionar</button>  
            {/snippet}
            
            <Disco info_disco={musicbrainz_to_disco(rg)} {acciones} {coverart_api_cache} />
        </div>
    {/each}
    
{/if}

<!-- <br/>
{JSON.stringify(resultados_musicbrainz)} -->
{/if}

<h2>Discos</h2>
{#each lista_discos_sorted as d (d.id)}
    <div class='disco-container' style='display: flex;'>
        {#snippet disco_acciones()}
            
                <button onclick={() => editar_disco(d.id)}>Editar</button>
                <button onclick={() => borrar_disco(d.id)}>Borrar</button>
            
        {/snippet}
        <!-- {@render disco(d)} -->
        <Disco info_disco={d} {coverart_api_cache} acciones={disco_acciones} />
        
    </div>
{/each}

<!-- <div class='disco'>
    <div class='disco-img-size' style='background-color: lightgray;'></div>
    <img class='disco-img-size' src="https://ia902203.us.archive.org/7/items/mbid-fc863ed0-e7f4-4689-9f9d-fd18ebfed033/mbid-fc863ed0-e7f4-4689-9f9d-fd18ebfed033-39142166955_thumb250.jpg"/>
    <div>
        <h3>Zedd - Telos</h3>
        <p>2024-08-30</p>
    </div>
</div> -->



<style>
* {
    font-family: 'Inter';
}

.disco-container + .disco-container {
    margin-top: 10px;
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