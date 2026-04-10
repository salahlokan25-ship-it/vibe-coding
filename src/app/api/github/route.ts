import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { files, repoName, token } = await req.json()

        if (!token) return NextResponse.json({ success: false, error: 'GitHub PAT is required' })
        if (!repoName) return NextResponse.json({ success: false, error: 'Repository name is required' })
        if (!files || Object.keys(files).length === 0) return NextResponse.json({ success: false, error: 'No files to commit' })

        // 1. Create Repository
        const createRes = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: repoName,
                description: 'Generated with BuildAI (vibe.ai)',
                private: true,
                auto_init: true // Creates an initial commit so we have a master branch
            })
        })

        let repoId = null;
        let owner = '';
        let url = '';

        if (!createRes.ok) {
            const err = await createRes.json()
            // If repository already exists, that's okay, we can just push to it.
            // But we need the owner username. Let's get the user.
            if (err.errors?.[0]?.message === 'name already exists on this account') {
                const userRes = await fetch('https://api.github.com/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userData = await userRes.json();
                owner = userData.login;
                url = `https://github.com/${owner}/${repoName}`;
            } else {
                return NextResponse.json({ success: false, error: `Failed to create repo: ${err.message}` })
            }
        } else {
            const repoData = await createRes.json()
            owner = repoData.owner.login;
            url = repoData.html_url;
            repoId = repoData.id;
        }

        // Wait a small amount for GitHub's internal database to sync if we just created auto_init
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 2. Get the latest commit SHA from the main branch
        const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/main`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        let branchData = await branchRes.json();

        // Try master if main doesn't exist
        if (!branchRes.ok) {
            const masterRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/master`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            branchData = await masterRes.json();
            if (!masterRes.ok) {
                return NextResponse.json({ success: false, error: 'Could not find main or master branch' })
            }
        }

        const baseTreeSha = branchData.object.sha;

        // 3. Create Blobs for all files
        const tree = []
        for (const [path, content] of Object.entries(files)) {
            // Remove leading slashes if any
            const safePath = path.startsWith('/') ? path.substring(1) : path;
            const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/blobs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({ content: content as string, encoding: 'utf-8' })
            })
            const blobData = await blobRes.json()
            if (!blobRes.ok) return NextResponse.json({ success: false, error: `Blob creation failed: ${blobData.message}` })

            tree.push({
                path: safePath,
                mode: '100644', // file
                type: 'blob',
                sha: blobData.sha
            })
        }

        // 4. Create a Tree
        const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({ base_tree: baseTreeSha, tree })
        })
        const treeData = await treeRes.json();
        if (!treeRes.ok) return NextResponse.json({ success: false, error: `Tree creation failed: ${treeData.message}` })

        // 5. Create a Commit
        const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
                message: 'Auto-sync from BuildAI 🚀',
                tree: treeData.sha,
                parents: [baseTreeSha]
            })
        })
        const commitData = await commitRes.json();
        if (!commitRes.ok) return NextResponse.json({ success: false, error: `Commit failed: ${commitData.message}` })

        // 6. Update the Reference
        const refRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${branchData.ref.split('/').pop()}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({ sha: commitData.sha, force: false })
        })
        const refData = await refRes.json()
        if (!refRes.ok) return NextResponse.json({ success: false, error: `Ref update failed: ${refData.message}` })

        return NextResponse.json({ success: true, url })

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message })
    }
}
