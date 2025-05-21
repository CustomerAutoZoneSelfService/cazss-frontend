<script lang="ts">
  export let data: string | undefined;
</script>

<div class="w-full max-w-[1000px] mx-auto border border-gray-300 rounded-lg overflow-hidden shadow-md">
  <iframe
    class="w-full h-[800px] border-none"
    src={data}
    title="PDF Viewer"
  ></iframe>
</div>