<script lang='ts'>
    let {info_disco, acciones, coverart_api_cache} = $props();
</script>

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

    <div class="disco-acciones">
        {@render acciones()}
    </div>
</div>

<style>
    .disco {
    display: flex;
    width: 100%;
}
.disco-detalles {
    flex-grow: 1;
}
.disco-acciones {
    display: flex;
    flex-direction: column;
    gap: 5px;
    justify-content: center;
}
.disco-img-size {
    width: 100px;
    height: 100px;
    object-fit: cover;
    margin-right: 10px;
}
.disco:hover {
    background-color: aliceblue;
}
</style>